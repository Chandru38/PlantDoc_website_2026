import Title from "./Title";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";

const API_MODEL1 = "https://chandrusankar-plantdoc-backend.hf.space/predict";
const API_MODEL2 = "https://chandrusankar-plantdoc-backend2.hf.space/predict";
const MODEL1_CLASSES = "https://drive.google.com/uc?export=download&id=1jtxZgiPYxe2VdM1RzrtWpoNulPZl_G0L"
const MODEL2_CLASSES = "https://drive.google.com/uc?export=download&id=1kzWKLi-H3obDEYRoKR3_dNrgORFn2XgP"

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

            const class1 = data1?.predicted_class || data1?.prediction;
            const class2 = data2?.predicted_class || data2?.prediction;
            
            if (class2 && MODEL2_CLASSES.includes(class2)) {
                console.log("Using Model 2");
                final = data2;
            }
            else if (class1 && MODEL1_CLASSES.includes(class1)) {
                console.log("Using Model 1");
                final = data1;
            }
            if (!final) {
                alert("Prediction failed from both models");
                return;
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
