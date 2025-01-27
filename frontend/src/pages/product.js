import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ProductComponent(){
    const navigate=useNavigate();
    const[products, setProducts]=useState([]);
    const[name, setName]=useState("");
    const[categoryName, setCategoryName]=useState("");
    const[price, setPrice]=useState(0);
    const[stock, setStock]=useState(0);


    const getAll=async()=>{
        const fetchProducts = async () => {
            try {
                const response = await axios.get("http://localhost:5000/products");
                setProducts(response.data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchProducts();
    }

    useEffect(() => {
        const fetchProducts=async()=>{
            await getAll();
        }
        fetchProducts();
        checkIsAdmin();
    }, []);

    const remove=async(_id)=>{
        let confirm=window.confirm("Ürünü silmek istiyor musunuz?");
        if(confirm)
        {
        try{
        let response=await axios.delete(`http://localhost:5000/products/remove/${_id}`);
        alert(response.data.message);
        await getAll();
        }catch(error){
            alert('Silme işlemi sırasında bir hata oluştu');
        }
    }
    }

    const add=async (e)=>{
        e.preventDefault();
        var input=document.querySelector("input[type='file']");
        const formData=new FormData();
        formData.append("name",name);
        formData.append("categoryName",categoryName);
        formData.append("stock",stock);
        formData.append("price",price);
        formData.append("image",input.files[0],input.files[0].name);

        var response=await axios.post("http://localhost:5000/products/add",formData);

        alert(response.data.message);

         // Modal'ı kapat
        document.getElementById('addModelCloseBtn').click();

        // State'leri sıfırla
        setName("");
        setCategoryName(0);
        setPrice(0);
        setStock(0);

        // Formu sıfırla
        e.target.reset();

        getAll();
    }

    const checkIsAdmin = () =>{
        let user= JSON.parse(localStorage.getItem("user"));
        if(!user.isAdmin){
            navigate("/")
        }
    }


    return(
        <>
        <div className="container mt-4">
            <div className="card">
                <div className="card-header">
                    <h1>Ürün Listesi</h1>
                </div>
                <div className="card-body">
                    <div className="form-group">
                        <button data-bs-toggle="modal" data-bs-target="#addModal" className="btn btn-outline-primary">
                            Yeni Ürün Ekle
                        </button>
                        <table className="table table-bordered table-hover mt-2">
                            <thead>
                                <tr>
                                    <th>Ürün No</th>
                                    <th>Resim</th>
                                    <th>Ürün Adı</th>
                                    <th>Kategori Adı</th>
                                    <th>Adet</th>
                                    <th>Fiyatı</th>
                                    <th>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product,index)=>(
                                    <tr key={product._id}>
                                        <td>{index+1}</td>
                                        <td>
                                            <img style={{width:"80px"}} src={'http://localhost:5000/' + product.imageUrl} />
                                        </td>
                                        <td>{product.name}</td>
                                        <td>{product.categoryName}</td>
                                        <td>{product.stock}</td>
                                        <td>{product.price}</td>
                                        <td>
                                            <button onClick={()=>remove(product._id)} className="btn btn-outline-danger btn-sm">
                                                Sil
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>


        <div className="modal fade" id="addModal"tabIndex="-1" aria-labelledby="addModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
            <div className="modal-header">
                <h1 className="modal-title fs-5" id="addModalLabel">Ürün Ekle</h1>
                <button type="button" className="btn-close" data-bs-dismiss="modal" id="addModelCloseBtn" aria-label="Close"></button>
            </div>
            <form onSubmit={add}>
            <div className="modal-body">
                <div className="form-group">
                    <label htmlFor="name">Ürün Adı</label>
                    <input className="form-control" value={name} onChange={(e)=>setName(e.target.value)} id="name" name="name"></input>
                </div>
                <div className="form-group mt-2">
                    <label htmlFor="categoryName">Kategori Adı</label>
                   <select className="form-control" value={categoryName} onChange={(e)=> setCategoryName(e.target.value)}>
                    <option value="0">Seçim Yapınız...</option>
                    <option>Sebze</option>
                    <option>Meyve</option>
                    <option>Kırtasiye</option>
                    <option>Diğer</option>
                   </select>
                </div>
                <div className="form-group mt-2">
                    <label htmlFor="stock">Stok Adedi</label>
                    <input className="form-control" value={stock} onChange={(e)=>setStock(e.target.value)} id="stock" name="stock"></input>
                </div>
                <div className="form-group mt-2">
                    <label htmlFor="price">Birim Fiyatı</label>
                    <input className="form-control" value={price} onChange={(e)=>setPrice(e.target.value)} id="price" name="price"></input>
                </div>
                <div className="form-group mt-2">
                    <label htmlFor="image">Resmi</label>
                    <input type="file" className="form-control"  id="image" name="image"></input>
                </div>
            </div>
            <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Kapat</button>
                <button type="submit" className="btn btn-primary">Kaydet</button>
            </div>
            </form>
            </div>
        </div>
        </div>
        </>
    )
}

export default ProductComponent;