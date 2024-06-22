import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";


function LayoutComponent(){
  const navigate=useNavigate();
  const [isAdmin,setIsAdmin]=useState(false);

  const logout=()=>{
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(()=>{
    if(!localStorage.getItem("token")){
      navigate("/login");
      //giriş yapılmadıysa layout kullanılan sayfalara girildiğinde logine atar.
    }else{
      checkIsAdmin();
    }
  },[navigate]);

  const checkIsAdmin=()=>{
    const userString = (localStorage.getItem("user"));
    if(userString){
      try{
        const user = JSON.parse(userString);
        if(user){
          setIsAdmin(user.isAdmin);
        }
      }catch(error){
        console.log("User data is not valid json",error);
        localStorage.removeItem("user");
        navigate("/login");
      }
    }else{
      navigate("/login");
    }
  };

    return(
        <>
<nav className="navbar navbar-expand-lg bg-body-tertiary">
  <div className="container-fluid">
    <a className="navbar-brand">FD E-Ticaret</a>
    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span className="navbar-toggler-icon"></span>
    </button>
    <div className="collapse navbar-collapse" id="navbarSupportedContent">
      <ul className="navbar-nav me-auto mb-2 mb-lg-0">
        <li className="nav-item mx-2">
          <Link to="/">Ana Sayfa</Link>
        </li>
        {
          isAdmin && (
          <li className="nav-item mx-2">
          <Link to="/products">Ürünler</Link>
        </li>
        )}
        <li className="nav-item mx-2">
          <Link to="/orders">Siparişlerim</Link>
        </li>
        <li className="nav-item mx-2">
          <Link to="/baskets">Sepetim</Link>
        </li>

      </ul>
      <button onClick={logout} className="btn btn-outline-danger" type="submit">Çıkış Yap</button>
    </div>
  </div>
</nav>

<Outlet />


        </>
    )
}

export default LayoutComponent;