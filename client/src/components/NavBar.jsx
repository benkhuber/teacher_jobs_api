function NavBar() {
    return <div className="navBar">
      <a className="navBarHome" href="/">Teacher Jobs</a>
      <div className="navBarLinksContainer">
        <a className="navBarLinks" href="/">Home</a>
        <a className="navBarLinks" href="/alljobs">All Current Jobs</a>
      </div>
    </div>;
  }
  
  export default NavBar;