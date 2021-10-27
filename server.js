const http = require('http');
let users = require('./data/dataUser');
const fs = require('fs')

const server = http.createServer((req, res) => {
    if(req.url === '/api/users' && req.method === 'GET') {
        async function getUsers(req, res) {
            try {
                const users = await findAll()
        
                res.writeHead(200, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify(users))
            } catch (error) {
                console.log(error)
            }
        }
        getUsers(req, res)
    } else if(req.url.match(/\/api\/users\/\w+/) && req.method === 'GET') {
        const id = req.url.split('/')[3]
        async function getUser(req, res, id) {
            try {
                const user = await findById(id)
        
                if(!user) {
                    res.writeHead(404, { 'Content-Type': 'application/json' })
                    res.end(JSON.stringify({ message: 'User Not Found' }))
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' })
                    res.end(JSON.stringify(user))
                }
            } catch (error) {
                console.log(error)
            }
        }
        getUser(req, res, id)
    } else if(req.url === '/api/users' && req.method === 'POST') {
        async function createUser(req, res) {
            try {
                const body = await getPostData(req)
        
                const { name, description, price } = JSON.parse(body)
        
                const user = {
                    name,
                    description,
                    price
                }
        
                const newUser = await create(user)
        
                res.writeHead(201, { 'Content-Type': 'application/json' })
                return res.end(JSON.stringify(newUser))  
        
            } catch (error) {
                console.log(error)
            }
        }
        createUser(req, res)
    } else if(req.url.match(/\/api\/users\/\w+/) && req.method === 'PUT') {
        const id = req.url.split('/')[3]
        async function updateUser(req, res, id) {
            try {
                const user = await findById(id)
        
                if(!user) {
                    res.writeHead(404, { 'Content-Type': 'application/json' })
                    res.end(JSON.stringify({ message: 'User Not Found' }))
                } else {
                    const body = await getPostData(req)
        
                    const { balance, picture, age, name, gender, company, email } = JSON.parse(body)
        
                    const userData = {
                        balance: balance || user.balance,
                        picture: picture || user.picture,
                        age: age || user.age,
                        name: name || user.name,
                        gender: gender || user.gender,
                        company: company || user.company,
                        email: email || user.email
                    }
        
                    const updateuser = await update(id, userData)
        
                    res.writeHead(200, { 'Content-Type': 'application/json' })
                    return res.end(JSON.stringify(updateuser)) 
                }
         
        
            } catch (error) {
                console.log(error)
            }
        }
        updateUser(req, res, id)
    } else if(req.url.match(/\/api\/users\/\w+/) && req.method === 'DELETE') {
        const id = req.url.split('/')[3]
        async function deleteUser(req, res, id) {
            try {
                const user = await findById(id)
        
                if(!user) {
                    res.writeHead(404, { 'Content-Type': 'application/json' })
                    res.end(JSON.stringify({ message: 'User Not Found' }))
                } else {
                    await remove(id)
                    res.writeHead(200, { 'Content-Type': 'application/json' })
                    res.end(JSON.stringify({ message: `User ${id} removed` }))
                }
            } catch (error) {
                console.log(error)
            }
        }
        deleteUser(req, res, id)
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ message: 'Route Not Found' }))
    }
})

const PORT =  process.env.PORT || 5000

server.listen(PORT, () => console.log(`Server running on port ${PORT}`))

/* ------------------------------------------------------------------------------------------ */



function writeDataToFile(filename, content) {
    fs.writeFileSync(filename, JSON.stringify(content), 'utf8', (err) => {
        if(err) {
            console.log(err)
        }
    })
}

function getPostData(req) {
    return new Promise((resolve, reject) => {
        try {
            let body = ''

            req.on('data', (chunk) => {
                body += chunk.toString()
            })

            req.on('end', () => {
                resolve(body)
            })
        } catch (error) {
            reject(err)
        }
    })
}
/* ------------------------------------------------------------------------------------------ */

function findAll() {
    return new Promise((resolve, reject) => {
        resolve(users)
    })
}

function findById(id) {
    return new Promise((resolve, reject) => {
        const user = users.find((p) => p.id === id)
        resolve(user)
    })
}

function create(user) {
    return new Promise((resolve, reject) => {
        const newUser = {id: users.length + 1, ...user}
        users.push(newUser)
        if (process.env.NODE_ENV !== 'test') {
            writeDataToFile('./data/dataUser.json', users);
        }
        resolve(newUser)
    })
}

function update(id, user) {
    return new Promise((resolve, reject) => {
        const index = users.findIndex((p) => p.id === id)
        users[index] = {id, ...user}
        if (process.env.NODE_ENV !== 'test') {
            writeDataToFile('./data/dataUser.json', users);
        }
        resolve(users[index])
    })
}

function remove(id) {
    return new Promise((resolve, reject) => {
        users = users.filter((p) => p.id !== id)
        if (process.env.NODE_ENV !== 'test') {
            writeDataToFile('./data/dataUser.json', users);
        }
        resolve()
    })
}