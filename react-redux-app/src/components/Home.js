const { Link } = require("react-router-dom")

export const Home = () => {
    return(
        <div>
            <h1>Welcome</h1>

            <div className="btns">
                <Link to={"/counter"} className="btn">Go to Counter Page</Link>
                <Link to={"/todos"} className="btn">Go to Todo Page</Link>
            </div>
        </div>
    )
}