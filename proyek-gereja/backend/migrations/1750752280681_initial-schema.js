/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  console.log(">>>>> Running migration: initial_schema");

  pgm.createTable("users", {
    id: "id",
    email: { type: "varchar(255)", notNull: true, unique: true },
    password_hash: { type: "varchar(255)", notNull: true },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("now()"),
    },
  });

  pgm.createTable("klasifikasi", {
    id: "id",
    nama: { type: "varchar(100)", notNull: true, unique: true },
  });

  pgm.createTable("ibadah", {
    id: "id",
    nama: { type: "varchar(150)", notNull: true },
    tanggal: { type: "date", notNull: true },
    waktu: { type: "varchar(50)" },
    deskripsi: { type: "text" },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("now()"),
    },
  });

  pgm.createTable("agenda", {
    id: "id",
    ibadah_id: {
      type: "integer",
      notNull: true,
      references: '"ibadah"',
      onDelete: "CASCADE",
    },
    urutan: { type: "integer", notNull: true },
    nama_agenda: { type: "varchar(255)", notNull: true },
    penanggung_jawab: { type: "varchar(150)" },
  });

  pgm.createIndex("agenda", "ibadah_id");

  pgm.createTable("kehadiran", {
    id: "id",
    ibadah_id: {
      type: "integer",
      notNull: true,
      references: '"ibadah"',
      onDelete: "CASCADE",
    },
    klasifikasi_id: {
      type: "integer",
      notNull: true,
      references: '"klasifikasi"',
      onDelete: "CASCADE",
    },
    jumlah_hadir: { type: "integer", notNull: true, default: 0 },
  });
  pgm.addConstraint("kehadiran", "kehadiran_ibadah_klasifikasi_uniq", {
    unique: ["ibadah_id", "klasifikasi_id"],
  });
  pgm.createIndex("kehadiran", "ibadah_id");
  pgm.createIndex("kehadiran", "klasifikasi_id");
};

exports.down = (pgm) => {
  pgm.dropTable("kehadiran", { ifExists: true, cascade: true });
  pgm.dropTable("agenda", { ifExists: true, cascade: true });
  pgm.dropTable("ibadah", { ifExists: true, cascade: true });
  pgm.dropTable("klasifikasi", { ifExists: true });
  pgm.dropTable("users", { ifExists: true });
};
