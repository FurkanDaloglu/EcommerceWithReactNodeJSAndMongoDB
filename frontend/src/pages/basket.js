import {useEffect, useState} from 'react';
import axios from 'axios';

function BasketComponent(){
    const [baskets,setBaskets] = useState([]);
    const [total,setTotal] = useState(0);

    const getAll=async()=>{
        let user = JSON.parse(localStorage.getItem("user"));
        let model = {userId:user._id};
        let response = await axios.post("http://localhost:5000/baskets/getAll",model);
        setBaskets(response.data);
    }

    const calc=(baskets)=>{
        let totale=0;
        for (let i = 0; i < baskets.length; i++) {
            totale += baskets[i].products[0].price*baskets[i].quentity
        }
        setTotal(totale);
    }

    const remove=async(_id)=>{
        let confirm=window.confirm("Sepetteki ürünü silmek istiyor musunu?");
        if(confirm){
            let model={_id:_id};
            await axios.post("http://localhost:5000/baskets/remove",model);
            getAll();
        }
    }

    const addOrder=async()=>{
            let user = JSON.parse(localStorage.getItem("user"));
            let model ={userId:user._id};
            await axios.post("http://localhost:5000/orders/add",model);
            getAll();
        }

    useEffect(()=>{
        getAll();
    },[]);

    useEffect(()=>{
        calc(baskets);
    },[baskets])

    return(
        <>
        <div className='conteiner mt-4'>
            <div className='card'>
                <div className='card-header'>
                    <h1 className='text-center'>Sepetteki Ürünler</h1>
                </div>
                <div className='card-body'>
                    <div className='row'>
                        <div className='col-md-8'>
                            <table className='table table-bordered table-hover'>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Ürün Adı</th>
                                        <th>Ürün Resmi</th>
                                        <th>Adedi</th>
                                        <th>Fiyatı</th>
                                        <th>İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {baskets.map((basket,index)=>(
                                        <tr key={index}>
                                            <td>{index +1}</td>
                                            <td>{basket.products[0].name}</td>
                                            <td>
                                                <img src={"http://localhost:5000/" + basket.products[0].imageUrl} width="75"/>
                                            </td>
                                            <td>{basket.quentity}</td>
                                            <td>{basket.products[0].price*basket.quentity}</td>
                                            <td>
                                                <button onClick={()=>remove(basket._id)} className='btn btn-outline-danger btn-sm'>Sil</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className='col-md-4'>
                            <div className='card'>
                                <div className='card-header'>
                                    <h4 className='text-center'>Sepet Toplamı</h4>
                                    <hr/>
                                        <h5 className='text-center'>Toplam Ürün Sayısı:{baskets.reduce((acc,basket)=>acc+basket.quentity,0)}</h5>
                                        <h5 className='alert alert-success text-center'>Toplam Tutar: {total} TL</h5>
                                    <hr/>
                                    <button onClick={addOrder} className='btn btn-outline-success w-100'>Ödeme Yap</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}

export default BasketComponent;