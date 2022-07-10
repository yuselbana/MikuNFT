// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function handler(req, res) {
  const tokenId = req.query.tokenId;
const name = `Miku #${tokenId}`;
const description = "Miku is a pog NFT Collection."
const image = `https://github.com/yuselbana/Miku-NFT-images/blob/main/public/images/${Number(tokenId)}.jpeg?raw=true`
  
return res.json({
  name: name,
  description: description,
  image:image,
});
}
