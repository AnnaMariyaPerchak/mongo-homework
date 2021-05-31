const faker = require('faker');

const generateUser = ({
  firstName = faker.name.firstName(),
  lastName = faker.name.lastName(),
  department,
  createdAt = new Date()
} = {}) => ({
  firstName,
  lastName,
  department,
  createdAt
});

const generateArticle=({
  name = faker.lorem.slug(),
  description = faker.lorem.text(),
  type,
  tags = []
}= {}) => ({
  name,
  description,
  type,
  tags
})

const student=(id,name,scores=[{},{},{}])=>({id,name,scores})

module.exports = {
  mapUser: generateUser,
  mapArticle: generateArticle,
  mapStudent: student,
  getRandomFirstName: () => faker.name.firstName()
};
