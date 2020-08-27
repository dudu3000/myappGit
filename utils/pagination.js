

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

    for(var i = 0; i < limit; i++){
        if(results.results[i] !== undefined)
            results.results[i].dataValues.index = i;
    }

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