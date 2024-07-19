import React from "react";
import { FaArrowRight } from "react-icons/fa";
import {Link} from "react-router-dom";
const Home = () => (
    <div>

        {/* section 1 */}

        <div className="relative mx-auto flex w-11/12 justify-center text-white border">

            <Link to={"/signup"}>

                <div className="mx-auto rounded-full bg-richblack-800 text-richblack-200 m-2 px-4 flex flex-row">
                    <div>Became an Instructor</div>
                    <FaArrowRight />
                </div>

            </Link>

        </div>


        {/* section 2 */}


        {/* section 3 */}


        {/* section 4 */}



    </div>
)

export default Home;