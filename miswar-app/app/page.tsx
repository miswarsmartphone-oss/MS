
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
type Product = {
  id: number;
  name: string;
  barcode: string;
  stock: number;
  price: number;
  cost: number;
};

export default function Home() {
  const [tab, setTab] = useState("Dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [stock, setStock] = useState("1");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [customer, setCustomer] = useState("");
  const [debt, setDebt] = useState("");
  const [services, setServices] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("miswar-products");
    if (saved) setProducts(JSON.parse(saved));
    const savedDebt = localStorage.getItem("miswar-debt");
    if (savedDebt) setDebt(savedDebt);
  }, []);

  function saveProducts(data: Product[]) {
    setProducts(data);
    localStorage.setItem("miswar-products", JSON.stringify(data));
  }

async function addProduct() {
  if (!name.trim() || !price) {
    alert("Isi nama barang dan harga jual");
    return;
  }

  const supabase = createClient();

  const { data, error } = await supabase
  .from("products")
  .insert({
    name: name.trim(),
    barcode: barcode.trim() || null,
    category: null,
    stock: Number(stock),
    purchase_price: Number(cost || 0),
    selling_price: Number(price),
  })
  .select()
  .single();

  if (error) {
    alert("Gagal menyimpan: " + error.message);
    return;
  }
  const item: Product = {
    id: Number(data.id),
    name: data.name,
    barcode: data.barcode || "",
    stock: Number(data.stock),
    price: Number(data.selling_price),
    cost: Number(data.purchase_price),
  };

  setProducts((prev) => [...prev, item]);

  setName("");
  setBarcode("");
  setStock("1");
  setPrice("");
  setCost("");

  alert("Barang berhasil disimpan ke Supabase");
}
  

  function sell(item: Product) {
    if (item.stock < 1) {
      alert("Stok barang habis");
      return;
    }
    const updated = products.map(p =>
      p.id === item.id ? { ...p, stock: p.stock - 1 } : p
    );
    saveProducts(updated);
    alert("Penjualan berhasil: " + item.name);
  }

  const money = (n: number) =>
    "Rp " + n.toLocaleString("id-ID");

  const totalStock = products.reduce((a, p) => a + p.stock, 0);
  const totalValue = products.reduce((a, p) => a + p.stock * p.cost, 0);

  const menu = [
    "Dashboard",
    "Kasir",
    "Inventory",
    "Utang Piutang",
    "Service HP",
    "Laporan",
  ];

  return (
    <main style={{
      minHeight: "100vh",
      background: "#f3f4f6",
      color: "#222",
      fontFamily: "Arial, sans-serif",
      paddingBottom: 35
    }}>
      <header style={{
        background: "#c90024",
        color: "white",
        padding: "24px 18px",
        borderRadius: "0 0 20px 20px"
      }}>
        <h1 style={{ margin: 0, fontSize: 25 }}>
          MISWAR SMARTPHONE
        </h1>
        <p style={{ marginBottom: 0 }}>
          Kasir • Inventory • Service HP
        </p>
      </header>

      <nav style={{
        display: "flex",
        overflowX: "auto",
        gap: 8,
        padding: 12,
        background: "white"
      }}>
        {menu.map(m => (
          <button key={m} onClick={() => setTab(m)}
            style={{
              padding: "11px 14px",
              border: 0,
              borderRadius: 10,
              whiteSpace: "nowrap",
              background: tab === m ? "#c90024" : "#eee",
              color: tab === m ? "white" : "#333",
              fontWeight: "bold"
            }}>
            {m}
          </button>
        ))}
      </nav>

      <section style={{ padding: 16 }}>
        {tab === "Dashboard" && <>
          <h2>Dashboard Toko</h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12
          }}>
            {[
              ["Total Barang", products.length],
              ["Jumlah Stok", totalStock],
              ["Nilai Persediaan", money(totalValue)],
              ["Stok Menipis", products.filter(p => p.stock <= 3).length]
            ].map(([label, value]) => (
              <div key={String(label)} style={{
                background: "white",
                padding: 18,
                borderRadius: 14,
                borderLeft: "4px solid #c90024"
              }}>
                <small>{label}</small>
                <h2 style={{ color: "#c90024", fontSize: 20 }}>
                  {value}
                </h2>
              </div>
            ))}
          </div>
          <h3>Selamat Datang di Miswar Smartphone</h3>
          <p>Kelola penjualan dan persediaan toko Anda.</p>
        </>}

        {tab === "Inventory" && <>
          <h2>Tambah Barang</h2>
          {[
            ["Nama Barang", name, setName],
            ["Barcode", barcode, setBarcode],
            ["Jumlah Stok", stock, setStock],
            ["Harga Modal", cost, setCost],
            ["Harga Jual", price, setPrice]
          ].map(([label, value, setter]: any) => (
            <div key={label} style={{ marginBottom: 12 }}>
              <label>{label}</label>
              <input value={value}
                onChange={e => setter(e.target.value)}
                placeholder={label}
                type={label === "Nama Barang" || label === "Barcode" ? "text" : "number"}
                style={{
                  display: "block",
                  width: "100%",
                  boxSizing: "border-box",
                  padding: 13,
                  marginTop: 5,
                  border: "1px solid #ddd",
                  borderRadius: 9
                }}
              />
            </div>
          ))}
          <button onClick={addProduct} style={primary}>
            + Simpan Barang
          </button>
          <h3>Daftar Persediaan</h3>
          {products.map(p => (
            <div key={p.id} style={card}>
              <b>{p.name}</b>
              <p>Barcode: {p.barcode || "-"}</p>
              <p>Stok: {p.stock} | Harga: {money(p.price)}</p>
              <button onClick={() =>
                saveProducts(products.filter(x => x.id !== p.id))
              } style={secondary}>Hapus</button>
            </div>
          ))}
        </>}

        {tab === "Kasir" && <>
          <h2>Kasir Penjualan</h2>
          {products.map(p => (
            <div key={p.id} style={card}>
              <b>{p.name}</b>
              <p>Stok: {p.stock}</p>
              <h3>{money(p.price)}</h3>
              <button onClick={() => sell(p)} style={primary}>
                Jual 1 Barang
              </button>
            </div>
          ))}
        </>}

        {tab === "Utang Piutang" && <>
          <h2>Utang Piutang</h2>
          <label>Nama Pelanggan</label>
          <input value={customer}
            onChange={e => setCustomer(e.target.value)}
            placeholder="Nama pelanggan" style={field}/>
          <label>Jumlah Piutang</label>
          <input value={debt}
            onChange={e => setDebt(e.target.value)}
            type="number" placeholder="Jumlah rupiah"
            style={field}/>
          <button style={primary} onClick={() => {
            localStorage.setItem("miswar-debt", debt);
            alert("Data jumlah piutang disimpan");
          }}>Simpan Piutang</button>
          <p>Nama: {customer || "-"}</p>
          <h3>Piutang: {money(Number(debt || 0))}</h3>
        </>}

        {tab === "Service HP" && <>
          <h2>Service Handphone</h2>
          <input id="service" placeholder="Nama pelanggan / kerusakan"
            style={field}/>
          <button style={primary} onClick={() => {
            const input = document.getElementById("service") as HTMLInputElement;
            if (input.value) {
              setServices([...services, input.value]);
              input.value = "";
            }
          }}>+ Tambah Service</button>
          {services.map((s, i) => (
            <div key={i} style={card}>{s}</div>
          ))}
        </>}

        {tab === "Laporan" && <>
          <h2>Laporan Inventory</h2>
          <div style={card}>
            <p>Total jenis barang: {products.length}</p>
            <p>Total stok: {totalStock}</p>
            <p>Nilai modal persediaan: {money(totalValue)}</p>
          </div>
        </>}
      </section>

      <footer style={{
        textAlign: "center",
        color: "#888",
        padding: 20
      }}>
        MISWAR SMARTPHONE © 2026
      </footer>
    </main>
  );
}

const primary: React.CSSProperties = {
  background: "#c90024",
  color: "white",
  border: 0,
  padding: 14,
  borderRadius: 10,
  fontWeight: "bold",
  width: "100%",
  marginBottom: 12
};

const secondary: React.CSSProperties = {
  background: "#eee",
  padding: 10,
  border: 0,
  borderRadius: 8
};

const card: React.CSSProperties = {
  background: "white",
  padding: 16,
  borderRadius: 12,
  marginBottom: 12,
  border: "1px solid #eee"
};

const field: React.CSSProperties = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  padding: 13,
  margin: "8px 0 15px",
  border: "1px solid #ddd",
  borderRadius: 9
};
