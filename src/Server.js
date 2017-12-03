const helmet = require('fastify-helmet');
const fetch = require('node-fetch');
const graphqlFastify = require('apollo-server-fastify').graphqlFastify;
const graphiqlFastify = require('apollo-server-fastify').graphiqlFastify;
const fastify = require('fastify')({
        logger: true
    });

const PORT = 8000;
const URL = `https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&market=USD&apikey=G6ZJR4B7HGVCEWKF&symbol=`

fastify.register(helmet);

fastify.get('/', (request, reply) => {

    const data = fetch(URL + 'BTC')
        .then(response => response.json())
        .then(data => {
            fastify.log.info(data)
            const currencyCode = data['Meta Data']['2. Digital Currency Code'];
            const currencyName = data['Meta Data']['3. Digital Currency Name'];
            const dailyData = data["Time Series (Digital Currency Daily)"];
            const lastMonthDates = getLastMonth(dailyData);
            const currencyMonthData = extractMonthData(dailyData, lastMonthDates);
            
            reply.code(200)
                 .header('Content-Type', 'application/json')
                 .send({
                    code: currencyCode,
                    currencyName: currencyName,
                    data: currencyMonthData
                 })
        }).catch(err => fastify.log.error(err))
    return data

})

const extractMonthData = (data, dates) => {
    return dates.map(date => {
        return {
            day: date,
            values: data[date]
        }
    });
}

const getLastMonth = data => {
    const dates = Object.keys(data);
    return dates.filter((value, index) => {
        if(index < 30) return value
    })
}

//for online editor 
fastify.get('/graphiql', graphiqlFastify({
    endpointURL: '/graphql'
}))

//for giving the access to the editor and working with graphql
fastify.post('/graphql', graphqlFastify({ schema: {} }));
fastify.get('/graphql', graphqlFastify({ schema: {} }));

fastify.listen(PORT, err => {
    if(err) throw err;
    fastify.log.info(`server ready at port ${fastify.server.address().port}`);
});

//TODO: add Apollo - graphQL support (basic implementation)
//TODO: refactor routing
//TODO: add environment variables