import Book from '../models/BookModel.js';

async function getBooks(req, res) {
  try {
    const response = await Book.findAll();
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
  }
}

async function getBookById(req, res) {
  try {
    const response = await Book.findOne({ where: { id: req.params.id } });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
  }
}

async function getBookByIsbn(req, res) {
  try {
    const response = await Book.findOne({ where: { isbn: req.params.isbn } });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
  }
}

async function addBook(req, res) {
  try {
    const { title, author, description, isbn, cover_url, available_copies, total_copies } = req.body;

    // Cek isbn sudah terdaftar
    const existingUser = await Book.findOne({ where: { isbn } });
    if (existingUser) {
      return res.status(409).json({ msg: "buku sudah terdaftar" });
    }
    // Buat buku
    await Book.create({
      title,
      author,
      description,
      isbn,
      cover_url,
      available_copies,
      total_copies
    });

    return res.status(201).json({ msg: "Berhasil Menambahkan Buku" });
  } catch (error) {
    console.error("Add Book error:", error);
    return res.status(500).json({ msg: "Terjadi kesalahan di server" });
  }
}

async function updateBook(req, res) {
  try{
    const { title, author, description, isbn, cover_url, available_copies, total_copies} = req.body;
    let updatedData = {
      title, author, description, isbn, cover_url, available_copies, total_copies
    }; //nyimpen jadi object

    const result = await Book.update(updatedData, {
        where: {
            id: req.params.id
        }
    });

    // Periksa apakah ada baris yang terpengaruh (diupdate)
    if (result[0] === 0) {
        return res.status(404).json({
            status: 'failed',
            message: 'Buku tidak ditemukan atau tidak ada data yang berubah',
            updatedData: updatedData,
            result
        });
    }

    res.status(200).json({msg:"Book Updated"});
  } catch(error){
    console.log(error.message);
  }
}

async function deleteBook(req, res) {
  try {
    await Book.destroy({ where: { id: req.params.id } });
    res.status(201).json({ msg: "Book Deleted" });
  } catch (error) {
    console.log(error.message);
  }
}

export {getBooks, getBookById, getBookByIsbn, addBook, updateBook, deleteBook};
