import Title from './Title'
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import upload from "../assets/upload_icon.svg"
const API_URL = "https://chandrusankar-plantdoc-backend.hf.space/predict";

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

            const res = await axios.post(
                API_URL,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            const data = res.data;

            setResult({
                class: data.predicted_class,
                confidence: data.confidence,
                details: data.remedies
            });

        } catch (error) {
            console.error(error);
            alert("Prediction failed. Check backend.");
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
                        <h2 className="mb-3">
                            {result.class}
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
