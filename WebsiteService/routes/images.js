var express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const { uploadFile, deleteFile, getObjectSignedUrl } = require('../api/s3');
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

router.get("/", async (req, res) => {
  // const posts = await prisma.posts.findMany({orderBy: [{ created: 'desc'}]})
  // for (let post of posts) {
  //   post.imageUrl = await getObjectSignedUrl(post.imageName)
  // }
  const imageUrl = "de610b8c7dd199ecdd996f8ba9fb8f8bdf1ba2ee7905c52b2148273d05eda2a4";
  res.render('image', {imageUrl})
})

router.post('/posts', upload.single('image'), async (req, res) => {
  const file = req.file
  const caption = req.body.caption
  const imageName = generateFileName()

  const fileBuffer = await sharp(file.buffer)
    .resize({ height: 1920, width: 1080, fit: "contain" })
    .toBuffer()

  await uploadFile(fileBuffer, imageName, file.mimetype)

  // await prisma.posts.create({
  //   data: {
  //     imageName,
  //     caption,
  //   }
  // })
  
  res.redirect("/")
})

router.post("/api/deletePost/:id", async (req, res) => {
  const id = +req.params.id
  const post = await prisma.posts.findUnique({where: {id}}) 

  await deleteFile(post.imageName)

  // await prisma.posts.delete({where: {id: post.id}})
  res.redirect("/")
})

module.exports = router;