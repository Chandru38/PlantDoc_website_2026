import Title from './Title'
import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";

const API_MODEL1 = "https://chandrusankar-plantdoc-backend.hf.space/predict";
const API_MODEL2 = "https://chandrusankar-plantdoc-backend2.hf.space/predict";

const DiseaseRecognize = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    // Lists of plants each model is trained on
    const MODEL1_PLANTS = ["Apple","Blueberry","Cherry","Corn","Grape","Orange","Peach","Pepper,_bell","Potato","Raspberry","Soybean","Squash","Strawberry","Tomato"];
    const MODEL2_PLANTS = ["Bottlegourd","Brinjal","Capsicum","Cassava","Coffee","Cucumber","Lemon","Onion","Rice","Rose","Sugercane","Watermelon"];

    const { getRootProps, getInputProps, open } = useDropzone({
        accept: { "image/*": [] },
        noClick: true,
        onDrop: (acceptedFiles) => {
            const selected = acceptedFiles[0];
            setFile(selected);
            // Cleanup old preview URL to save memory
            if (preview) URL.revokeObjectURL(preview);
            setPreview(URL.createObjectURL(selected));
            setResult(null); 
        },
    });

    const handlePredict = async () => {
        if (!file) return alert("Upload an image first!");

        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);

            // Fire both requests simultaneously
            const [res1, res2] = await Promise.allSettled([
                axios.post(API_MODEL1, formData),
                axios.post(API_MODEL2, formData)
            ]);

            const data1 = res1.status === "fulfilled" ? res1.value.data : null;
            const data2 = res2.status === "fulfilled" ? res2.value.data : null;

            // Helper to get plant name from "Plant___Disease" string
            const getPlantName = (res) => res?.predicted_class?.split("___")[0]?.trim() || "";

            const plant1 = getPlantName(data1);
            const plant2 = getPlantName(data2);

            let finalSelection = null;

            const isModel1Valid = data1 && MODEL1_PLANTS.includes(plant1);
            const isModel2Valid = data2 && MODEL2_PLANTS.includes(plant2);

            // LOGIC:
            if (isModel1Valid && !isModel2Valid) {
                finalSelection = data1;
            } else if (isModel2Valid && !isModel1Valid) {
                finalSelection = data2;
            } else if (isModel1Valid && isModel2Valid) {
                // If both claim to know it, pick the one with higher confidence
                finalSelection = data1.confidence >= data2.confidence ? data1 : data2;
            } else {
                // Fallback: If neither matches the list, try the one with higher confidence anyway
                finalSelection = (data1?.confidence || 0) >= (data2?.confidence || 0) ? data1 : data2;
            }

            if (!finalSelection) {
                throw new Error("No data received from either model.");
            }

            setResult({
                class: finalSelection.predicted_class,
                confidence: finalSelection.confidence,
                details: finalSelection.remedies // Assuming 'remedies' contains description/prevention/etc.
            });

        } catch (error) {
            console.error("Prediction Error:", error);
            alert("Prediction failed. Please ensure the backend is active.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id='disease-recognizer' className='flex flex-col items-center gap-7 px-4 sm:px-12 lg:px-24 xl:px-40 pt-30 text-text bg-(--color-hero)'>
            <Title title='Disease Recognizer' desc='Upload a plant leaf image to detect disease and get remedies instantly.' />

            <div className="flex flex-col items-center p-10 w-full">
                <div {...getRootProps()} className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer w-full max-w-xl">
                    <input {...getInputProps()} />
                    <svg xmlns="http://www.w3.org/2000/svg" width="62" height="52" fill="currentColor" className="bi bi-cloud-arrow-up-fill" viewBox="0 0 16 16">
                        <path d="M8 2a5.53 5.53 0 0 0-3.594 1.342c-.766.66-1.321 1.52-1.464 2.383C1.266 6.095 0 7.555 0 9.318 0 11.366 1.708 13 3.781 13h8.906C14.502 13 16 11.57 16 9.773c0-1.636-1.242-2.969-2.834-3.194C12.923 3.999 10.69 2 8 2m2.354 5.146a.5.5 0 0 1-.708.708L8.5 6.707V10.5a.5.5 0 0 1-1 0V6.707L6.354 7.854a.5.5 0 1 1-.708-.708l2-2a.5.5 0 0 1 .708 0z"/>
                    </svg>
                    <p>Drag & drop image here</p>
                    <button type='button' onClick={open} className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">Browse</button>
                </div>

                {file && <p className="mt-4 text-sm">Selected File: <strong>{file.name}</strong></p>}
                {preview && <img src={preview} alt="preview" className="mt-4 w-64 rounded-lg shadow-md" />}

                <button onClick={handlePredict} disabled={loading} className="mt-6 px-6 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                    {loading ? "Predicting..." : "Predict"}
                </button>

                {result && (
                    <div className="mt-8 bg-green-400 text-slate-900 p-6 rounded-lg w-full max-w-2xl shadow-md">
                        <h2 className="mb-3 font-bold text-xl">{result.class.replace(/_/g, " ").replace(/___/g, " - ")}</h2>
                        <p className="mb-3 text-lg"><strong>Confidence:</strong> {result.confidence}%</p>

                        {result.details && (
                            <div className="space-y-4">
                                {result.details.description && <p>{result.details.description}</p>}
                                
                                {result.details.remedies?.length > 0 && (
                                    <div>
                                        <h3 className="font-bold">Remedies:</h3>
                                        <ul className="list-disc ml-6">{result.details.remedies.map((item, i) => <li key={i}>{item}</li>)}</ul>
                                    </div>
                                )}

                                {result.details.precautions?.length > 0 && (
                                    <div>
                                        <h3 className="font-bold">Precautions:</h3>
                                        <ul className="list-disc ml-6">{result.details.precautions.map((item, i) => <li key={i}>{item}</li>)}</ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiseaseRecognize;
