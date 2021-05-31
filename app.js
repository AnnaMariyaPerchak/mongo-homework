'use strict'

const {mapUser, getRandomFirstName, mapArticle, mapStudent} = require('./util')

// db connection and settings
const connection = require('./config/connection')
let userCollection,articleCollection,studentCollection
run()

async function run() {
  await connection.connect()

  // await connection.get().createCollection('users')
  // await connection.get().dropCollection('users')
  userCollection = connection.get().collection('users')

  // await connection.get().createCollection('articles')
  // await connection.get().dropCollection('articles')
  articleCollection = connection.get().collection('articles')

  studentCollection = connection.get().collection('students')

  // await createUsers()
  // await deleteUser()
  // await updateFirstName()
  // await findUsers()

  // await createArticles()
  // await findArticle()
  // await addTagsToOthers()
  // await findArticlesWithTags()
  // await pullArticles()

  // await findStudentsWithWorstHomework()

  await connection.close()
}


// -------------------------Users--------------------

// - Create 2 users per department (a, b, c)
async function createUsers() {
  const departments = ['a', 'a', 'b', 'b', 'c', 'c']
  const users = departments.map(d => ({department: d})).map(mapUser)
  try {
    const {result} = await userCollection.insertMany(users)
    console.log(`Added ${result.n} users`)
  } catch (err) {
    console.error(err)
  }
}

// - Delete 1 user from department (a)
async function deleteUser() {
  try {
    const {result} = await userCollection.deleteOne({department: 'a'})
    console.log(`Removed ${result.n} user`)
  } catch (err) {
    console.error(err)
  }
}

// - Update firstName for users from department (b)
async function updateFirstName() {
  try {
    // const [find, update] = [{department: 'b'}, {$set: {firstName: getRandomFirstName()}}]
    const usersB = await userCollection.find({department: 'b'}).toArray()
    const bulkWrite = usersB.map(user => ({
      updateOne: {
        filter: {_id: user._id},
        update: {$set: {firstName: getRandomFirstName()}}
      }
    }))
    const {result} = await userCollection.bulkWrite(bulkWrite)
    console.log(`Updated ${result.nModified} users`)
  } catch (err) {
    console.error(err)
  }
}

// - Find all users from department (c)
async function findUsers() {
  try {
    const [find, projection] = [{department: 'c'}, {firstName: 1}]
    const users = [...(await userCollection.find(find, projection).toArray())].map(mapUser)
    console.log('Users:')
    users.forEach(console.log)
  } catch (err) {
    console.error(err)
  }
}
//---------------- Articles -------------------

//Create 5 articles per each type (a, b, c)
async function createArticles() {
  const types = ['a', 'a','a', 'a', 'a','b', 'b', 'b', 'b', 'b', 'c', 'c','c', 'c', 'c',]
  const articles = types.map(d => ({type: d})).map(mapArticle)
  try {
    const {result} = await articleCollection.insertMany(articles)
    console.log(`Added ${result.n} articles`)
  } catch (err) {
    console.error(err)
  }
}

//Find articles with type a, and update tag list with next value [‘tag1-a’, ‘tag2-a’, ‘tag3’]
async function findArticle() {
  try {
    const query={type:'a'}
    const  update={$set:{tags:['tag1-a', 'tag2-a', 'tag3']}}
    const {result} = await articleCollection.updateMany(query,update)
    console.log(`Updated ${result.n} articles by adding tags [‘tag1-a’, ‘tag2-a’, ‘tag3’]`)
  } catch (err) {
    console.error(err)
  }
}

//Add tags [‘tag2’, ‘tag3’, ‘super’] to other articles except articles from type a
async function addTagsToOthers() {
  try {
    const query = {type:{$ne:'a'}}
    const update={$set:{tags:['tag2', 'tag3', 'super']}}
    const {result} =await articleCollection.updateMany(query,update)
    console.log(`Updated ${result.n} articles by addding tags [‘tag2’, ‘tag3’, ‘super’]`)
  } catch (err) {
    console.error(err)
  }
}

//Find all articles that contains tags [tag2, tag1-a]
async function findArticlesWithTags() {
  try {
    const result =[...(await articleCollection.find({tags: {$in : ['tag2', 'tag1-a']}}).toArray())].map(mapArticle)
    // const result =[...(await articleCollection.find({tags: {$all : ['tag2', 'tag1-a']}}).toArray())].map(mapArticle)
    console.log(`Find ${result.length} articles that contains tags [tag2, tag1-a]`)
  } catch (err) {
    console.error(err)
  }
}

//Pull [tag2, tag1-a] from all articles
async function pullArticles() {
  try {
    // const result =[...(await articleCollection.find({tags: {$in : ['tag2', 'tag1-a']}}).toArray())].map(mapArticle)
    // const result =[...(await articleCollection.find({tags: {$all : ['tag2', 'tag1-a']}}).toArray())].map(mapArticle)
    // console.log(result)

    // const {result} = await articleCollection.deleteMany({tags: {$in : ['tag2', 'tag1-a']}})
    // console.log(`Removed ${result.n} article`)
    const {result} =await articleCollection.updateMany({}, {$pull:{tags: {$in : ['tag2', 'tag1-a']}}})
    console.log(`Updated ${result.n} articles by pulling 'tag2' or 'tag1-a`)
  } catch (err) {
    console.error(err)
  }
}

// import data from students.json
// mongoimport --uri "mongodb+srv://ann-mariya:nazar1234@cluster0.u6erk.mongodb.net" --db tc --collection students --file D:\TechMagicCourse\mongo-homework\students.json --jsonArray

// Find all students who have the worst score for homework, sort by descent
async function findStudentsWithWorstHomework() {
  try {
    let cursor = [...(await studentCollection.aggregate([
      {
        "$unwind": "$scores"
      },
      {
        "$match": {
          "scores.type": "homework"
        }
      },
      {
        "$group": {
          "_id": "$_id",
          "minitem": {
            "$min": "$scores.score"
          }
        }
      },
      {
        "$sort": {
          "minitem": -1
        }
      }
    ]).toArray())].map(function(el) { return el })
    console.log(cursor)
  } catch (err) {
    console.error(err)
  }
}

// Find all students who have the best score for quiz and the worst for homework, sort by ascending
// Find all students who have best scope for quiz and exam
// Calculate the average score for homework for all students
// Delete all students that have homework score <= 60
// Mark students that have quiz score => 80
// Write a query that group students by 3 categories (calculate the average grade for three subjects)
//   a => (between 0 and 40)
//   b => (between 40 and 60)
//   c => (between 60 and 100)
