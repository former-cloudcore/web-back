import http from "http";

//TODO: Check socket with both http and https

export async function handleMessagePosting(text: string, chatId: string, token: string) {
    const data = JSON.stringify({text, chatId});

    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Content-Length': data.length
            },
            port: process.env.PORT,
            path: `/chat/messages`,
            method: 'POST',
        }, (res) => {
            const chunks = [];

            res.on('data', (chunk) => {
                chunks.push(chunk);
            });

            res.on('end', () => {
                const body = Buffer.concat(chunks).toString();
                resolve(body);
            });

            res.on('error', (err) => {
                reject(err);
            });
        });

        req.write(data);
        req.end();
    });
}
