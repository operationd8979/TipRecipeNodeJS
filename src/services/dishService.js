const CachingService = require('./cachingService');
const DishModel = require('../models/dishModel');
const IngredientModel = require('../models/ingredientModel');
const TypeModel = require('../models/typeModel');

class DishService {
    static instance = null;

    constructor() {
        this.cachingService = CachingService.getInstance();
    }

    static getInstance() {
        if (this.instance == null) {
            this.instance = new DishService();
        }
        return this.instance;
    }

    async getDishById(dishId) {
        return DishModel.getDishById(dishId);
    }

    async getDishs(search, ingredients, types, itemsPerPage, offset) {
        return DishModel.getDishs(search, ingredients, types, itemsPerPage, offset);
    }

    async implementRating(dishs, userID) {
        let dishIDRaw = dishs.map((dish) => dish.dishID);
        let ratingUserOfDishs = await DishModel.getRatingUserOfDishs(dishIDRaw, userID);
        let isNeedCollaborativeFilter = ratingUserOfDishs.length != dishs.length;
        if (!isNeedCollaborativeFilter) {
            let currentDate = new Date().getTime();
            ratingUserOfDishs.forEach((rating) => {
                if (rating.rating !== null) {
                    return;
                }
                if (rating.preRating == 0) {
                    isNeedCollaborativeFilter = true;
                    return;
                }
                if (rating.preRatingTime == null) return;
                let daysDifference = Math.floor(
                    (currentDate - new Date(rating.preRatingTime).getTime()) / (60 * 60 * 24),
                );
                if (daysDifference >= 7) {
                    isNeedCollaborativeFilter = true;
                    return;
                }
            });
        }
        if (isNeedCollaborativeFilter) {
            var isNeedPreRating = true;
            var averageRating = await DishModel.getAverageRating();
            var ratingMT = this.cachingService.checkExistedCache('ratingMT') || {};
            var userIDs = [];
            var dishIDs = [];
            var indexUser = -1;
            var simmilarUser = [];
            if (Object.keys(ratingMT).length != 0) {
                isNeedPreRating = false;
                userIDs = Object.keys(ratingMT);
                dishIDs = Object.keys(ratingMT[userIDs[0]]);
                indexUser = userIDs.indexOf(userID);
                if (indexUser == -1) {
                    isNeedPreRating = true;
                }
            }
            if (isNeedPreRating) {
                let totalRatings = await DishModel.getRating();
                let countDish = averageRating.length;
                let countUser = totalRatings.length / countDish;
                for (let i = 0; i < countUser; i++) {
                    if (totalRatings[i].userID == userID) {
                        indexUser = i;
                    }
                    userIDs[i] = totalRatings[i].userID;
                }
                for (let i = 0; i < countDish; i++) {
                    dishIDs[i] = averageRating[i].dishID;
                }
                for (let i = 0; i < countUser; i++) {
                    for (let j = 0; j < countDish; j++) {
                        if (!ratingMT[userIDs[i]]) ratingMT[userIDs[i]] = {};
                        ratingMT[userIDs[i]][dishIDs[j]] =
                            totalRatings[i + j * countUser].rating - averageRating[j].avgRating;
                    }
                }
                let isDoneWriteCache = this.cachingService.addCache('ratingMT', ratingMT);
                if (isDoneWriteCache) {
                    //save new cache and update avgRating
                    await this.updateAvgRating();
                }
            }
            for (let i = 0; i < userIDs.length; i++) {
                simmilarUser[i] = {};
                simmilarUser[i].userID = userIDs[i];
                simmilarUser[i].value = this.cosineSimilarity(
                    ratingMT[userIDs[i]],
                    ratingMT[userIDs[indexUser]],
                );
                simmilarUser[i].different = 0;
                let countDif = 0;
                for (let j = 0; j < dishIDs.length; j++) {
                    if (
                        ratingMT[userIDs[indexUser]][dishIDs[j]] != 0 &&
                        ratingMT[userIDs[i]][dishIDs[j]] != 0
                    ) {
                        simmilarUser[i].different +=
                            ratingMT[userIDs[i]][dishIDs[j]] / ratingMT[userIDs[indexUser]][dishIDs[j]];
                        countDif++;
                    }
                }
                if (countDif != 0) {
                    simmilarUser[i].different = simmilarUser[i].different / countDif;
                }
            }
            simmilarUser.sort((a, b) => b.value - a.value);
            // console.log(simmilarUser);
        }
        let countUpdateQueryy = 0;
        let updateQuery = [];
        for (let i = 0; i < dishs.length; i++) {
            dishs[i].rating = 0;
            dishs[i].preRating = 0;
            dishs[i].preRatingTime = '';
            dishs[i].isRated = false;
            for (let j = 0; j < ratingUserOfDishs.length; j++) {
                if (dishs[i].dishID == ratingUserOfDishs[j].dishID) {
                    dishs[i].rating = ratingUserOfDishs[j].rating;
                    dishs[i].preRating = ratingUserOfDishs[j].preRating;
                    dishs[i].preRatingTime = ratingUserOfDishs[j].preRatingTime;
                    if (dishs[i].rating != null) dishs[i].isRated = true;
                    break;
                }
            }
            if (!dishs[i].isRated && isNeedCollaborativeFilter) {
                for (let j = 0; j < simmilarUser.length; j++) {
                    let preRating = ratingMT[simmilarUser[j].userID][dishs[i].dishID] || 0;
                    if (preRating != 0 && simmilarUser[j].different != 0) {
                        dishs[i].preRating =
                            (preRating +
                                Number(
                                    averageRating.find((item) => item.dishID == dishs[i].dishID).avgRating,
                                )) /
                            simmilarUser[j].different;
                        updateQuery[countUpdateQueryy++] = {
                            dishID: dishs[i].dishID,
                            userID: userID,
                            predictedRating: dishs[i].preRating,
                        };
                        break;
                    }
                }
            }
        }
        if (countUpdateQueryy > 0) {
            await DishModel.updatePredictedRating(updateQuery);
        }
        return dishs;
    }

    async getDetailDishById(dishId) {
        return DishModel.getDetailDishById(dishId);
    }

    async rateDish(dishID, rating, userID) {
        return DishModel.rateDish(dishID, rating, userID);
    }

    async getIngredients() {
        return IngredientModel.getIngredients();
    }

    async getTypes() {
        return TypeModel.getTypes();
    }

    async getRecommendDishsByUser(userID) {
        return DishModel.getRecommendDishsByUser(userID);
    }

    async getRatingUserOfDish(dishID, userID) {
        return DishModel.getRatingUserOfDish(dishID, userID);
    }

    async updateAvgRating() {
        return DishModel.updateAvgRating();
    }

    cosineSimilarity(vectorA, vectorB) {
        let dotProduct = 0;
        for (let key in vectorA) {
            if (vectorB[key] != undefined) {
                dotProduct += vectorA[key] * vectorB[key];
            }
        }
        let magnitudeA = Math.sqrt(
            Object.values(vectorA).reduce((acc, value) => {
                return acc + value * value;
            }, 0),
        );
        let magnitudeB = Math.sqrt(
            Object.values(vectorB).reduce((acc, value) => {
                return acc + value * value;
            }, 0),
        );
        if (magnitudeA && magnitudeB) {
            return dotProduct / (magnitudeA * magnitudeB);
        } else {
            return 0;
        }
    }
}

module.exports = DishService;
