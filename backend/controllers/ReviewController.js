import Review from "../models/ReviewModel.js";

async function getReviewsByIsbn(req, res) {
  try {
    const response = await Review.findAll({where: { isbn: req.params.isbn }});
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
  }
}

async function addReview(req, res) {
  try {
    const { email, isbn, rating, comment } = req.body;

    // Buat buku
    await Review.create({
      email,
      isbn,
      rating,
      comment,
    });

    return res.status(201).json({ msg: "Berhasil Menambahkan Review" });
  } catch (error) {
    console.error("Add Review error:", error);
    return res.status(500).json({ msg: "Terjadi kesalahan di server" });
  }
}

export { getReviewsByIsbn, addReview};