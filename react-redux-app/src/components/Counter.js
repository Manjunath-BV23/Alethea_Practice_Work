import { useDispatch, useSelector } from "react-redux";
import { addCount, subCount } from "../redux/action";
import { Link } from "react-router-dom";

export const Counter = () => {
    const dispatch = useDispatch();

    const count = useSelector((store) => store.count)

    // const [result, setResult] = useState(0);

    // const addCount = (n) => {
    //     setResult(result + n);
    // }
    // const subCount = (n) => {
    //     setResult(result - n);
    // }

    return (
        <div className="container">
            <div>
                <h1>Counter App</h1>
                <br />

                <Link to={"/"} className="btn">Go back to Home</Link>
                <div className="result">
                    <h4>Result: {count}</h4>
                </div>
                <div className="btns">
                    <button className="btn" onClick={() => dispatch(addCount(1))}>Add 1</button>
                    <button className="btn" onClick={() => dispatch(subCount(1))}>Sub 1</button>
                    <button className="btn" onClick={() => dispatch(addCount(2))}>Add 2</button>
                    <button className="btn" onClick={() => dispatch(subCount(2))}>Sub 2</button>
                </div>
            </div>

        </div>
    )
}