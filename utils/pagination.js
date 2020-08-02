

function pagination(req, res, model){
    const {
        'req.query': query
    } = req;

    const page = parseInt(query.page);
    const limit = parseInt(query.limit);
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
    if(results.results.length == 0){

        throw Error('Not found!');

    }
    res.paginatedResults = results;
}

module.exports = {
    pagination: function(req, res, model){
        return pagination(req, res, model);
    }
};