

function pagination(req, res, model){
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = {};
    if(endIndex < model.length){
       
        results.next = {
            page: page + 1,
            limit: limit
        };
    }
    if(startIndex > 0){
        
        results.previous = {
            page: page - 1,
            limit: limit
        };
    }
    results.results = model.slice(startIndex, endIndex);
    if(results.results[0] !== undefined)
        results.results[0].dataValues.index = 0;
    if(results.results[1] !== undefined)
        results.results[1].dataValues.index = 1;
    if(results.results[2] !== undefined)
        results.results[2].dataValues.index = 2;
    if(results.results[3] !== undefined)
        results.results[3].dataValues.index = 3;
    if(results.results[4] !== undefined)
        results.results[4].dataValues.index = 4;
    if(results.results[5] !== undefined)
        results.results[5].dataValues.index = 5;
    if(results.results.length == 0){

        throw Error('Posts not found!');

    }
    return results;
}

module.exports = {
    pagination: function(req, res, model){
        return pagination(req, res, model);
    }
};