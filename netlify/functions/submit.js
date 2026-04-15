exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const payload = JSON.parse(event.body);

        const response = await fetch(
            'https://hooks.airtable.com/workflows/v1/genericWebhook/appRBOiUXED6LbxnG/wflxxdYqe0AVql918/wtrLzc3wdvlzPISXn',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }
        );

        const result = await response.json();

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify(result)
        };
    } catch (err) {
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: err.message })
        };
    }
};
