module.exports = async function (context, req) {
    let database = await require('../database.js')();
    const valueSeperator = ',';
    const filters = Object.keys(req.query);
    // Boolean Filters
    ['isForHelpers', 'isForHelpees'].map(filterName => {
        if(filters.includes(filterName)) {
            database = database.filter(record => !!record[filterName] == ("1" == req.query[filterName]));
        }
    });
    // Keyword filters
    ['beneficiaryTypes', 'communicationTypes', 'zips'].map(filterName => {
        if(filters.includes(filterName)) {
            let options = req.query[filterName].split(valueSeperator);
            database = database.filter(record => record[filterName].filter(x => options.includes(x)).length);
        }
    });
    if(filters.includes('categories')) {
        let options = req.query.categories.split(valueSeperator);
        database = database.filter(record => record.categories.filter(x => options.includes(x.name)).length);
    }
    if(filters.includes('subCategories')) {
        let options = req.query.subCategories.split(valueSeperator);
        database = database.filter(record => record.categories.filter(category => category.children.filter(x => options.includes(x.name)).length).length);
    }
    // Respond
    context.res = {
        status: 200,
        body: JSON.stringify(database),
        headers: {
            'Content-Type': 'application/json'
        }
    };    
};