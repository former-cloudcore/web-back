import http from "http";
import https from "https";


export async function handleMessagePosting(text: string, chatId: string, token: string) {
    const data = JSON.stringify({ text: encodeURIComponent(text), chatId });

    return new Promise((resolve, reject) => {
        let req;
        if (process.env.NODE_ENV !== 'prod') {
            req = http.request({
                hostname: 'localhost',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Content-Length': data.length
                },
                port: process.env.PORT,
                path: `/api/chat/messages`,
                method: 'POST',
            }, (res) => {
                const chunks = [];

                res.on('data', (chunk) => {
                    chunks.push(chunk);
                });

                res.on('end', () => {
                    const body = Buffer.concat(chunks).toString();
                    try {
                        const json = JSON.parse(body);
                        resolve(json);
                    } catch (error) {
                        console.error('Failed to parse message:', error);
                        reject(error);
                    }
                });


                res.on('error', (err) => {
                    reject(err);
                });
            });
        } else {
            req = https.request({
                hostname: 'localhost',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Content-Length': data.length
                },
                port: process.env.PORT,
                path: `/api/chat/messages`,
                method: 'POST',
            }, (res) => {
                const chunks = [];

                res.on('data', (chunk) => {
                    chunks.push(chunk);
                });

                res.on('end', () => {
                    const body = Buffer.concat(chunks).toString();
                    try {
                        const json = JSON.parse(body);
                        resolve(json);
                    } catch (error) {
                        console.error('Failed to parse message:', error);
                        reject(error);
                    }
                });


                res.on('error', (err) => {
                    reject(err);
                });
            });
        }

        req.write(data);
        req.end();
    });
}
