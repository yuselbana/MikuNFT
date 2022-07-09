// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function handler(req, res) {
  const tokenId = req.query.tokenId;
const name = `Miku #${tokenId}`;
const description = "Miku is a pog NFT Collection."
const image = `https://github.com/yuselbana/Miku-NFT-images/blob/c0c2db35e1f83eb61347fae2909b6fdf42529a81/public/images/${Number(tokenId)}.jpeg`
  
return res.json({
  name: name,
  description: description,
  image:image,
});
}
