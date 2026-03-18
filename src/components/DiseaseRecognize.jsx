import Title from './Title'
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import upload from "../assets/upload_icon.svg"

const API_MODEL1 = "https://chandrusankar-plantdoc-backend.hf.space/predict";
const API_MODEL2 = "https://chandrusankar-plantdoc-backend2.hf.space/predict";


const DiseaseRecognize = () => {

    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const { getRootProps, getInputProps, open } = useDropzone({
        accept: { "image/*": [] },
        noClick: true,
        onDrop: (acceptedFiles) => {
            const selected = acceptedFiles[0];
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
            setResult(null); // reset old result
        },
    });

    const handlePredict = async () => {
    if (!file) return alert("Upload an image first!");

    const formData = new FormData();
    formData.append("file", file);

    try {
        setLoading(true);

        const [res1, res2] = await Promise.allSettled([
            axios.post(API_MODEL1, formData),
            axios.post(API_MODEL2, formData)
        ]);

        const data1 = res1.status === "fulfilled" ? res1.value.data : null;
        const data2 = res2.status === "fulfilled" ? res2.value.data : null;

        console.log("Model1:", data1);
        console.log("Model2:", data2);

        let final = null;

        const class1 = (data1?.predicted_class || "").trim();
        const class2 = (data2?.predicted_class || "").trim();

        // 🔥 Extract plant name
        const getPlant = (cls) => cls.split("___")[0];

        const plant1 = class1 ? getPlant(class1) : "";
        const plant2 = class2 ? getPlant(class2) : "";

        console.log("Plant1:", plant1);
        console.log("Plant2:", plant2);

        // ✅ Define plant groups (IMPORTANT)
        const MODEL1_PLANTS = [
            "Apple___Apple_scab",
            "Apple___Black_rot",
            "Apple___Cedar_apple_rust",
            "Apple___healthy",
            "Background_without_leaves",
            "Blueberry___healthy",
            "Cherry___Powdery_mildew",
            "Cherry___healthy",
            "Corn___Cercospora_leaf_spot Gray_leaf_spot",
            "Corn___Common_rust",
            "Corn___Northern_Leaf_Blight",
            "Corn___healthy",
            "Grape___Black_rot",
            "Grape___Esca_(Black_Measles)",
            "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
            "Grape___healthy",
            "Orange___Haunglongbing_(Citrus_greening)",
            "Peach___Bacterial_spot",
            "Peach___healthy",
            "Pepper,_bell___Bacterial_spot",
            "Pepper,_bell___healthy",
            "Potato___Early_blight",
            "Potato___Late_blight",
            "Potato___healthy",
            "Raspberry___healthy",
            "Soybean___healthy",
            "Squash___Powdery_mildew",
            "Strawberry___Leaf_scorch",
            "Strawberry___healthy",
            "Tomato___Bacterial_spot",
            "Tomato___Early_blight",
            "Tomato___Late_blight",
            "Tomato___Leaf_Mold",
            "Tomato___Septoria_leaf_spot",
            "Tomato___Spider_mites Two-spotted_spider_mite",
            "Tomato___Target_Spot",
            "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
            "Tomato___Tomato_mosaic_virus",
            "Tomato___healthy"
            
        ];

        const MODEL2_PLANTS = [
            "Bottlegourd___Anthracnose",
            "Bottlegourd___Downey_mildew",
            "Bottlegourd___fresh_leaf",
            "Brinjal___Cercospora Leaf Spot",
            "Brinjal___healthy",
            "Capsicum___Bacterial_spot",
            "Capsicum___healthy",
            "Cassava___bacterial_blight",
            "Cassava___brown_streak_disease",
            "Cassava___green_mottle",
            "Cassava___healthy",
            "Cassava___mosaic_disease",
            "Coffee___healthy",
            "Coffee___red_spider_mite",
            "Coffee___rust",
            "Cucumber___Bacterial_Wilt",
            "Cucumber___Gummy_Stem_Blight",
            "Cucumber___Healthy_leaf",
            "Grape___black_measles",
            "Grape___black_rot",
            "Grape___healthy",
            "Grape___leaf_blight",
            "Lemon___Bacterial_Blight",
            "Lemon___Citrus_Canker",
            "Lemon___Curl_Virus",
            "Lemon___Healthy",
            "Lemon___Sooty_Mould", 
            "Onion___Alternaria_D",
            "Onion___Healthy",
            "Onion___Purple_blotch",
            "Onion___Virosis-D",
            "Rice___bacterial_blight",
            "Rice___blast",
            "Rice___brown_spot",
            "Rice___tungro",
            "Rose___healthy",
            "Rose___rust",
            "Rose___slug_sawfly",
            "Sugercane___healthy",
            "Sugercane___mosaic",
            "Sugercane___red_rot",
            "Sugercane___rust",
            "Sugercane___yellow_leaf",
            "Watermelon___downy_mildew",
            "Watermelon___healthy",
            "Watermelon___mosaic_virus"
        ];

        // 🔥 FINAL DECISION LOGIC
        if (MODEL2_PLANTS.includes(plant2) && !MODEL1_PLANTS.includes(plant2)) {
            console.log("✅ Using Model 2");
            final = data2;
        } 
        else if (MODEL1_PLANTS.includes(plant1)) {
            console.log("✅ Using Model 1");
            final = data1;
        }
        else if (data1) {
            console.log("⚠️ Fallback → Model 1");
            final = data1;
        }
        else if (data2) {
            console.log("⚠️ Fallback → Model 2");
            final = data2;
        }

        if (!final) {
            alert("Prediction failed from both models");
            return;
        }

        setResult({
            class: final.predicted_class,
            confidence: final.confidence,
            details: final.remedies
        });

    } catch (error) {
        console.error(error);
        alert("Prediction failed");
    } finally {
        setLoading(false);
    }
};
    return (
        <div id='disease-recognizer' className='flex flex-col items-center gap-7 px-4 sm:px-12 lg:px-24 xl:px-40 pt-30 text-text bg-(--color-hero)'>

            <Title
                title='Disease Recognizer'
                desc='Upload a plant leaf image to detect disease and get remedies instantly.'
            />

            <div className="flex flex-col items-center p-10 w-full">

                {/* Drag & Drop */}
                <div
                    {...getRootProps()}
                    className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer w-full max-w-xl"
                >
                    <input {...getInputProps()} />
                    {/* <img src={upload} alt="upload icon" className="w-12" /> */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="62" height="52" fill="currentColor" className="bi bi-cloud-arrow-up-fill" viewBox="0 0 16 16">
                        <path d="M8 2a5.53 5.53 0 0 0-3.594 1.342c-.766.66-1.321 1.52-1.464 2.383C1.266 6.095 0 7.555 0 9.318 0 11.366 1.708 13 3.781 13h8.906C14.502 13 16 11.57 16 9.773c0-1.636-1.242-2.969-2.834-3.194C12.923 3.999 10.69 2 8 2m2.354 5.146a.5.5 0 0 1-.708.708L8.5 6.707V10.5a.5.5 0 0 1-1 0V6.707L6.354 7.854a.5.5 0 1 1-.708-.708l2-2a.5.5 0 0 1 .708 0z"/>
                    </svg>
                    <p>Drag & drop image here</p>
                    <button
                        type='button'
                        onClick={open}
                        className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                    >
                        Browse
                    </button>
                </div>

                {/* Selected file */}
                {file && (
                    <p className="mt-4 text-sm">
                        Selected File: <strong>{file.name}</strong>
                    </p>
                )}

                {/* Image Preview */}
                {preview && (
                    <img
                        src={preview}
                        alt="preview"
                        className="mt-4 w-64 rounded-lg shadow-md"
                    />
                )}

                {/* Predict Button */}
                <button
                    onClick={handlePredict}
                    disabled={loading}
                    className="mt-6 px-6 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-700"
                >
                    {loading ? "Predicting..." : "Predict"}
                </button>

                {/* RESULT SECTION */}
                {result && (
                    <div className="mt-8 bg-green-400 text-text p-6 rounded-lg w-full max-w-2xl shadow-md">

                        {/* Predicted Class */}
                        <h2 className="mb-3 wrap-break-word text-amber-950 text-lg sm:text-xl">
                            {result.class.replace(/_/g, " ")}
                        </h2>

                        <p className="mb-3">
                            <strong>Confidence:</strong> {result.confidence}%
                        </p>

                        {/* If disease details exist */}
                        {result.details && (
                            <>
                                {result.details.description && (
                                    <p className="mb-3">
                                        {result.details.description}
                                    </p>
                                )}

                                {/* Remedies */}
                                {result.details.remedies?.length > 0 && (
                                    <>
                                        <h3 className="font-semibold mt-4">Remedies:</h3>
                                        <ul className="list-disc ml-6">
                                            {result.details.remedies.map((item, index) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ul>
                                    </>
                                )}

                                {/* Precautions */}
                                {result.details.precautions?.length > 0 && (
                                    <>
                                        <h3 className="font-semibold mt-4">Precautions:</h3>
                                        <ul className="list-disc ml-6">
                                            {result.details.precautions.map((item, index) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ul>
                                    </>
                                )}

                                {/* Prevention */}
                                {result.details.prevention?.length > 0 && (
                                    <>
                                        <h3 className="font-semibold mt-4">Prevention:</h3>
                                        <ul className="list-disc ml-6">
                                            {result.details.prevention.map((item, index) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </>
                        )}

                    </div>
                )}

            </div>
        </div>
    );
};

export default DiseaseRecognize;
