import Reservation from "../models/ReservationModel.js";
import Book from "../models/BookModel.js";

async function addReservation(req, res) {
  try {
    const { email, isbn, status, reserved_at, confirmed_at } = req.body;

    // Cari buku berdasarkan ISBN
    const book = await Book.findOne({ where: { isbn } });
    if (!book) {
      return res.status(404).json({ msg: "Buku tidak ditemukan" });
    }

    if (book.available_copies <= 0) {
      return res.status(400).json({ msg: "Tidak ada salinan tersedia" });
    }

    // Buat reservasi
    await Reservation.create({
      email,
      isbn,
      status,
      reserved_at,
      confirmed_at,
    });

    // Kurangi salinan tersedia
    

    return res.status(201).json({ msg: "Berhasil Reservasi" });
  } catch (error) {
    console.error("Reservasi error:", error);
    return res.status(500).json({ msg: "Terjadi kesalahan di server" });
  }
}

async function getReservations(req, res) {
  try {
    const response = await Reservation.findAll({
      include: [
        {
          model: Book,
          attributes: ["title", "cover_url", "isbn", "available_copies"], // sesuaikan dengan kebutuhan
        },
      ],
    });

    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
  }
}

async function getReservationsByEmail(req, res) {
  try {
    const response = await Reservation.findAll({
      where: { email: req.params.email },
      include: [
        {
          model: Book,
          attributes: ["title", "cover_url", "isbn", "available_copies"], // sesuaikan dengan kebutuhan
        },
      ],
    });
    res.status(200).json(response);
  } catch (error) {
    console.log("Error fetching reservation by email:", error.message);
    res.status(500).json({ msg: "Terjadi kesalahan server" });
  }
}

async function confirmReservation(req, res) {
  try {
    const { status } = req.body;

    // Validasi status yang diizinkan
    const allowedStatus = ["pending", "confirmed", "cancelled", "returned"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ msg: "Status tidak valid" });
    }

    // Ambil reservasi lama (buat cek status lama dan isbn yang benar)
    const reservation = await Reservation.findOne({ where: { id: req.params.id } });
    if (!reservation) {
      return res.status(404).json({ msg: "Reservasi tidak ditemukan" });
    }

    // Ambil buku berdasarkan reservation.isbn, bukan dari req.body
    const book = await Book.findOne({ where: { isbn: reservation.isbn } });
    if (!book) {
      return res.status(404).json({ msg: "Buku tidak ditemukan" });
    }

    // Update stok hanya kalau status berubah
    if (reservation.status !== status) {
      if (status === "confirmed") {
        if (book.available_copies <= 0) {
          return res.status(400).json({ msg: "Tidak ada salinan tersedia" });
        }
        book.available_copies -= 1;
      } else if (status === "cancelled") {
        book.available_copies += 1;
      }
      await book.save();
    }

    // Update reservasi
    const updatedData = {
      status,
      confirmed_at: status === "confirmed" ? new Date() : null,
    };

    const result = await Reservation.update(updatedData, {
      where: {
        id: req.params.id,
      },
    });

    if (result[0] === 0) {
      return res.status(404).json({
        status: "failed",
        message: "Reservasi tidak ditemukan atau tidak diubah",
      });
    }

    return res.status(200).json({ msg: "Status reservasi berhasil diperbarui" });
  } catch (error) {
    console.error("Update reservasi error:", error);
    return res.status(500).json({ msg: "Terjadi kesalahan server" });
  }
}



async function cancelReservation(req, res) {
  try {
    const { status } = req.body;
    // Validasi status yang diizinkan
    const allowedStatus = ["pending", "confirmed", "cancelled", "returned"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ msg: "Status tidak valid" });
    }

    // Siapkan data yang akan diupdate
    const updatedData = {
      status,
      confirmed_at: status === "cancelled" ? new Date() : null,
    };

    const result = await Reservation.update(updatedData, {
      where: {
        id: req.params.id,
      },
    });

    if (result[0] === 0) {
      return res.status(404).json({
        status: "failed",
        message: "Reservasi tidak ditemukan atau tidak diubah",
      });
    }
    
    return res
      .status(200)
      .json({ msg: "Status reservasi berhasil diperbarui" });
  } catch (error) {
    console.error("Update reservasi error:", error.message);
    return res.status(500).json({ msg: "Terjadi kesalahan server" });
  }
}

async function deleteReservation(req, res) {
  try {
    await Reservation.destroy({ where: { id: req.params.id } });
    res.status(201).json({ msg: "Reservation Deleted" });
  } catch (error) {
    console.log(error.message);
  }
}

async function returnBook(req, res) {
  try {
    const { status } = req.body;

    // Validasi status yang diizinkan
    const allowedStatus = ["pending", "confirmed", "cancelled", "returned"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ msg: "Status tidak valid" });
    }

    // Ambil reservasi lama (buat cek status lama dan isbn yang benar)
    const reservation = await Reservation.findOne({ where: { id: req.params.id } });
    if (!reservation) {
      return res.status(404).json({ msg: "Reservasi tidak ditemukan" });
    }

    // Ambil buku berdasarkan reservation.isbn, bukan dari req.body
    const book = await Book.findOne({ where: { isbn: reservation.isbn } });
    if (!book) {
      return res.status(404).json({ msg: "Buku tidak ditemukan" });
    }

    // Update stok hanya kalau status berubah
    if (reservation.status !== status) {
      if (status === "returned") {
        
        book.available_copies += 1;
      } 
      await book.save();
    }

    // Update reservasi
    const updatedData = {
      status,
      returned_at: status === "returned" ? new Date() : null,
    };

    const result = await Reservation.update(updatedData, {
      where: {
        id: req.params.id,
      },
    });

    if (result[0] === 0) {
      return res.status(404).json({
        status: "failed",
        message: "Reservasi tidak ditemukan atau tidak diubah",
      });
    }

    return res.status(200).json({ msg: "Status reservasi berhasil diperbarui" });
  } catch (error) {
    console.error("Update reservasi error:", error);
    return res.status(500).json({ msg: "Terjadi kesalahan server" });
  }
}

export {
  addReservation,
  getReservations,
  getReservationsByEmail,
  confirmReservation,
  cancelReservation,
  deleteReservation,
  returnBook
};
