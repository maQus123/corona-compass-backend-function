module.exports = async function (context, req) {
    // Connect airtable
    const Airtable = require('airtable');
    const db = Airtable.base('appIXD32LmYq6mlXV');
    // Load data
    const retrieveBucket = (bucketName) => {
        return new Promise((resolve, reject) => {
            let results = [];
            db(bucketName).select().eachPage((records, fetchNextPage) => {
                records.forEach(function(record) {
                    let props = record['_rawJson'];            
                    results.push(props.fields);
                });
                fetchNextPage();
            }, (err) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }
    initiatives = await retrieveBucket('Initiatives');
    // Clean data
    initiatives.map(initiative => {
        initiative['BeneficiaryTypes'] = (initiative['BeneficiaryTypesNames'] || '').split('|');
        initiative['Categories'] = (initiative['CategoriesNames'] || '').split('|');
        initiative['Cities'] = (initiative['CitiesNames'] || '').split('|').map(city => city.trim());
        initiative['CommunicationTypes'] = (initiative['CommunicationTypesNames'] || '').split('|');
        initiative['Zips'] = (initiative['Zips'] || '').split(', ');
        delete initiative['BeneficiaryTypesNames'];
        delete initiative['CategoriesNames'];
        delete initiative['CitiesNames'];
        delete initiative['CommunicationTypesNames'];
        Object.keys(initiative).map(key => {
            initiative[key.charAt(0).toLowerCase() + key.slice(1)] = initiative[key];
            delete initiative[key];
        });
        return initiative;
    });
    // Respond
    context.res = {
        status: 200,
        body: JSON.stringify(initiatives),
        headers: {
            'Content-Type': 'application/json'
        }
    };    
};