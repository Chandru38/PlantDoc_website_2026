import Title from './Title'
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";

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
            setResult(null);
        },
    });

    const handlePredict = async () => {
        if (!file) return alert("Upload an image first!");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("image", file); // 🔥 important for HF compatibility

        try {
            setLoading(true);

            const [res1, res2] = await Promise.allSettled([
                axios.post(API_MODEL1, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                    timeout: 20000
                }),
                axios.post(API_MODEL2, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                    timeout: 20000
                })
            ]);

            console.log("RAW RES1:", res1);
            console.log("RAW RES2:", res2);

            const data1 = res1.status === "fulfilled" ? res1.value.data : null;
            const data2 = res2.status === "fulfilled" ? res2.value.data : null;

            console.log("Model1:", data1);
            console.log("Model2:", data2);

            // ❌ If both failed
            if (!data1 && !data2) {
                alert("Both models failed. Check console.");
                return;
            }

            // ✅ Normalize confidence
            const normalizeConfidence = (c) => {
                if (!c) return 0;
                if (typeof c === "string") return parseFloat(c);
                if (c <= 1) return c * 100;
                return c;
            };

            if (data1) data1.confidence = normalizeConfidence(data1.confidence);
            if (data2) data2.confidence = normalizeConfidence(data2.confidence);

            // ✅ VALID CLASS LISTS
            const MODEL1_PLANTS = [
                "Apple___Apple_scab","Apple___Black_rot","Apple___Cedar_apple_rust","Apple___healthy",
                "Background_without_leaves","Blueberry___healthy","Cherry___Powdery_mildew","Cherry___healthy",
                "Corn___Cercospora_leaf_spot Gray_leaf_spot","Corn___Common_rust","Corn___Northern_Leaf_Blight","Corn___healthy",
                "Grape___Black_rot","Grape___Esca_(Black_Measles)","Grape___Leaf_blight_(Isariopsis_Leaf_Spot)","Grape___healthy",
                "Orange___Haunglongbing_(Citrus_greening)","Peach___Bacterial_spot","Peach___healthy",
                "Pepper,_bell___Bacterial_spot","Pepper,_bell___healthy",
                "Potato___Early_blight","Potato___Late_blight","Potato___healthy",
                "Raspberry___healthy","Soybean___healthy","Squash___Powdery_mildew",
                "Strawberry___Leaf_scorch","Strawberry___healthy",
                "Tomato___Bacterial_spot","Tomato___Early_blight","Tomato___Late_blight","Tomato___Leaf_Mold",
                "Tomato___Septoria_leaf_spot","Tomato___Spider_mites Two-spotted_spider_mite",
                "Tomato___Target_Spot","Tomato___Tomato_Yellow_Leaf_Curl_Virus","Tomato___Tomato_mosaic_virus","Tomato___healthy"
            ];

            const MODEL2_PLANTS = [
                "Bottlegourd___Anthracnose","Bottlegourd___Downey_mildew","Bottlegourd___fresh_leaf",
                "Brinjal___Cercospora Leaf Spot","Brinjal___healthy",
                "Capsicum___Bacterial_spot","Capsicum___healthy",
                "Cassava___bacterial_blight","Cassava___brown_streak_disease","Cassava___green_mottle",
                "Cassava___healthy","Cassava___mosaic_disease",
                "Coffee___healthy","Coffee___red_spider_mite","Coffee___rust",
                "Cucumber___Bacterial_Wilt","Cucumber___Gummy_Stem_Blight","Cucumber___Healthy_leaf",
                "Grape___black_measles","Grape___black_rot","Grape___healthy","Grape___leaf_blight",
                "Lemon___Bacterial_Blight","Lemon___Citrus_Canker","Lemon___Curl_Virus","Lemon___Healthy","Lemon___Sooty_Mould",
                "Onion___Alternaria_D","Onion___Healthy","Onion___Purple_blotch","Onion___Virosis-D",
                "Rice___bacterial_blight","Rice___blast","Rice___brown_spot","Rice___tungro",
                "Rose___healthy","Rose___rust","Rose___slug_sawfly",
                "Sugercane___healthy","Sugercane___mosaic","Sugercane___red_rot","Sugercane___rust","Sugercane___yellow_leaf",
                "Watermelon___downy_mildew","Watermelon___healthy","Watermelon___mosaic_virus"
            ];

            const isValidModel1 =
                data1 && MODEL1_PLANTS.includes(data1.predicted_class);

            const isValidModel2 =
                data2 && MODEL2_PLANTS.includes(data2.predicted_class);

            console.log({
                validModel1: isValidModel1,
                validModel2: isValidModel2
            });

            let final = null;

            // 🔥 DECISION LOGIC
            if (isValidModel1 && isValidModel2) {
                final = data1.confidence > data2.confidence ? data1 : data2;
                console.log("⚖️ Both valid → higher confidence used");
            } else if (isValidModel1) {
                final = data1;
                console.log("✅ Model 1 selected");
            } else if (isValidModel2) {
                final = data2;
                console.log("✅ Model 2 selected");
            } else {
                final = data1 || data2;
                console.log("⚠️ Fallback used");
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
            console.error("FULL ERROR:", error);

            if (error.response) {
                console.error("Response error:", error.response.data);
            } else if (error.request) {
                console.error("No response received:", error.request);
            } else {
                console.error("Error message:", error.message);
            }

            alert("Prediction failed - check console");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='flex flex-col items-center gap-7 px-4 pt-30'>

            <Title
                title='Disease Recognizer'
                desc='Upload a plant leaf image to detect disease and get remedies instantly.'
            />

            <div className="flex flex-col items-center p-10 w-full">

                <div
                    {...getRootProps()}
                    className="p-8 border-2 border-dashed rounded-lg w-full max-w-xl text-center"
                >
                    <input {...getInputProps()} />
                    <p>Drag & drop image here</p>
                    <button onClick={open}>Browse</button>
                </div>

                {preview && <img src={preview} className="mt-4 w-64" />}

                <button onClick={handlePredict} disabled={loading}>
                    {loading ? "Predicting..." : "Predict"}
                </button>

                {result && (
                    <div className="mt-8">
                        <h2>{result.class}</h2>
                        <p>Confidence: {result.confidence}%</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiseaseRecognize;
