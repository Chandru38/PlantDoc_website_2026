import Title from "./Title";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";

const API_MODEL1 = "https://chandrusankar-plantdoc-backend.hf.space/predict";
const API_MODEL2 = "https://chandrusankar-plantdoc-backend2.hf.space/predict";
const MODEL1_CLASSES = [
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
]
const MODEL2_CLASSES = [
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
]

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
            if (!selected) return;

            setFile(selected);
            setPreview(URL.createObjectURL(selected));
            setResult(null);
        },
    });

    // Send image to model
    const sendToModel = async (url) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post(url, formData);
        return response.data;
    };

    const handlePredict = async () => {

        if (!file) {
            alert("Upload an image first!");
            return;
        }

        setLoading(true);
        setResult(null);

        try {

            const [res1, res2] = await Promise.allSettled([
                sendToModel(API_MODEL1),
                sendToModel(API_MODEL2)
            ]);

            const data1 = res1.status === "fulfilled" ? res1.value : null;
            const data2 = res2.status === "fulfilled" ? res2.value : null;

            console.log("Model1:", data1);
            console.log("Model2:", data2);

            let final = null;

            // 🔥 DEFINE CLASSES FIRST (MISSING IN YOUR CODE)
            const class1 = data1?.predicted_class || data1?.prediction;
            const class2 = data2?.predicted_class || data2?.prediction;
            
            // Optional normalization (recommended)
            const normalize = (str) => str?.trim();
            
            const normClass1 = normalize(class1);
            const normClass2 = normalize(class2);
            
            const isValidModel1 = normClass1 && MODEL1_CLASSES.includes(normClass1);
            const isValidModel2 = normClass2 && MODEL2_CLASSES.includes(normClass2);
            
            if (isValidModel1 && !isValidModel2) {
                console.log("✅ Using Model 1");
                final = data1;
            }
            else if (!isValidModel1 && isValidModel2) {
                console.log("✅ Using Model 2");
                final = data2;
            }
            else if (isValidModel1 && isValidModel2) {
                console.log("⚠️ Both models valid → using Model 1 as priority");
                final = data1; // or switch to data2 if you prefer
            }
            else {
                console.log("⚠️ No valid match → fallback");
                final = data1 || data2;
            }

            setResult({
                class: final.predicted_class || final.prediction,
                confidence: ((Number(final.confidence) || 0) * 100).toFixed(2),
                details: final.remedies
            });

        } catch (error) {

            console.error("Prediction error:", error);
            alert("Prediction failed");

        } finally {

            setLoading(false);

        }
    };

    return (
        <div
            id="disease-recognizer"
            className="flex flex-col items-center gap-7 px-4 sm:px-12 lg:px-24 xl:px-40 pt-30 text-text bg-(--color-hero)"
        >

            <Title
                title="Disease Recognizer"
                desc="Upload a plant leaf image to detect disease and get remedies instantly."
            />

            <div className="flex flex-col items-center p-10 w-full">

                {/* Drag & Drop */}
                <div
                    {...getRootProps()}
                    className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer w-full max-w-xl"
                >

                    <input {...getInputProps()} />

                    <p>Drag & drop image here</p>

                    <button
                        type="button"
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
                    disabled={!file || loading}
                    className="mt-6 px-6 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-700"
                >
                    {loading ? "Predicting..." : "Predict"}
                </button>

                {/* RESULT */}
                {result && (
                    <div className="mt-8 bg-green-400 text-text p-6 rounded-lg w-full max-w-2xl shadow-md">

                        <h2 className="mb-3 text-xl font-semibold">
                            {result.class}
                        </h2>

                        <p className="mb-3">
                            <strong>Confidence:</strong> {result.confidence}%
                        </p>

                        {result.details && (
                            <>
                                {result.details.description && (
                                    <p className="mb-3">
                                        {result.details.description}
                                    </p>
                                )}

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
