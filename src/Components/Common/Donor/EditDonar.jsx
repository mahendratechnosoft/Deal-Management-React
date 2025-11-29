import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { useLayout } from "../../Layout/useLayout";
import { FormInput, FormSelect, FormTextarea } from "../../BaseComponet/CustomeFormComponents";

function EditDonar() {
    const navigate = useNavigate();
    const { donorId } = useParams();
    const { LayoutComponent, role } = useLayout();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("personal");

    // --- State Management ---

    // 1. Personal Info State
    const [personalInfo, setPersonalInfo] = useState({
        name: "", age: "", dateOfBirth: "", adharCardNo: "", marriedStatus: "",
        maleKidsCount: "", femaleKidsCount: "", height: "", weight: "",
        religion: "", skinColor: "", eyeColor: "", education: "", profession: "",
        address: "", city: "", pincode: "", phoneNumber: "", email: "",
        selfeImage: null, fullLengthImage: null,
        // Medical History
        hospitalAdmissionStatus: false, hospitalAdmissionReason: "",
        surgeryStatus: false, surgeryReason: "",
        bloodDonationStatus: false, bloodDonationReason: "",
        prolongedIllnessStatus: false, prolongedIllnessReason: "",
        status: ""
    });

    // 2. Family Info State (Split into Brothers and Sisters)
    const [brothers, setBrothers] = useState([]);
    const [sisters, setSisters] = useState([]);

    // 3. Blood Reports State
    const [bloodReports, setBloodReports] = useState([]);

    // 4. Semen Report State
    const [semenReport, setSemenReport] = useState({});

    // 5. Sample Report State
    const [sampleReport, setSampleReport] = useState({});

    const tabs = [
        { id: "personal", label: "Personal Information" },
        { id: "family", label: "Family Information" },
        { id: "blood", label: "Blood Reports" },
        { id: "semen", label: "Semen Report" },
        { id: "sample", label: "Sample Storage" },
    ];

    // Options
    const statusOptions = [{ value: true, label: "Yes" }, { value: false, label: "No" }];
    const marriedOptions = [{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }];
    const skinColorOptions = [{ value: "Fair", label: "Fair" }, { value: "Wheatish", label: "Wheatish" }, { value: "Dark", label: "Dark" }];
    const eyeColorOptions = [{ value: "Brown", label: "Brown" }, { value: "Black", label: "Black" }, { value: "Gray", label: "Gray" }, { value: "Blue", label: "Blue" }, { value: "Green", label: "Green" }, { value: "Hazel", label: "Hazel" }, { value: "Amber", label: "Amber" }];
    const educationOptions = [{ value: "UnderGraduation", label: "Under Graduation" }, { value: "PostGraduation", label: "Post Graduation" }, { value: "Masters", label: "Masters" }, { value: "Graduated", label: "Graduated" }];


    // --- Data Fetching ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (activeTab === "personal") {
                    const res = await axiosInstance.get(`getDonorById/${donorId}`);
                    setPersonalInfo(res.data);
                }
                else if (activeTab === "family") {
                    const res = await axiosInstance.get(`getDonorFamilyInfo/${donorId}`);
                    const data = res.data || [];

                    // Parse the combined API data into separate arrays for UI
                    const bList = data.map(item => ({
                        donorFamailyId:item.donorFamailyId,
                        age: item.brotherAge,
                        profession: item.brotherProfession,
                        kidsCount: item.brotherKidsCount,
                        illness: item.brotherIllness
                    })).filter(b => b.age || b.profession); // Optional: Filter out empty rows if needed

                    const sList = data.map(item => ({
                        donorFamailyId:item.donorFamailyId,
                        age: item.sisterAge,
                        profession: item.sisterProfession,
                        kidsCount: item.sisterKidsCount,
                        illness: item.sisterIllness
                    })).filter(s => s.age || s.profession);

                    // If empty, initialize with one empty row
                    setBrothers(bList.length ? bList : [{ age: "", profession: "", kidsCount: "", illness: "",donorFamailyId:"" }]);
                    setSisters(sList.length ? sList : [{ age: "", profession: "", kidsCount: "", illness: "",donorFamailyId:"" }]);
                }
                else if (activeTab === "blood") {
                    const res = await axiosInstance.get(`getDonorBloodReport/${donorId}`);
                    setBloodReports(res.data || []);
                }
                else if (activeTab === "semen") {
                    const res = await axiosInstance.get(`getSemenReportByDonorId/${donorId}`);
                    setSemenReport(res.data || { donorId: donorId });
                }
                else if (activeTab === "sample") {
                    const res = await axiosInstance.get(`getSampleReportByDonorId/${donorId}`);
                    setSampleReport(res.data || { donorId: donorId });
                }
            } catch (err) {
                console.error(`Failed to fetch ${activeTab} data`, err);
            } finally {
                setLoading(false);
            }
        };
        if (donorId) fetchData();
    }, [activeTab, donorId]);


    // --- Generic Handlers ---
    const handleObjectChange = (e, stateSetter) => {
        const { name, value, type, checked } = e.target;
        stateSetter(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSelectChange = (option, name, stateSetter) => {
        stateSetter(prev => ({
            ...prev,
            [name]: option ? option.value : ""
        }));
    };

    // --- Image Handling ---
    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleImageChange = async (e, fieldName) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const base64DataUrl = await convertToBase64(file);
                const rawBase64 = base64DataUrl.split(',')[1];
                setPersonalInfo(prev => ({ ...prev, [fieldName]: rawBase64 }));
            } catch (error) {
                toast.error("Error processing image");
            }
        }
    };


    // --- SUBMIT HANDLERS (Per Tab) ---

    const updatePersonal = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axiosInstance.put("updateDonor", personalInfo);
            toast.success("Personal Information Updated!");
        } catch (error) {
            toast.error("Update failed.");
        } finally { setLoading(false); }
    };

    const updateFamily = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Merge Brothers and Sisters arrays back into the single object structure expected by API
        // We match them by index. If lengths differ, we pad with empty values.
        const maxLen = Math.max(brothers.length, sisters.length);
        const payload = [];

        for (let i = 0; i < maxLen; i++) {
            const bro = brothers[i] || { age: "", profession: "", kidsCount: "", illness: "" };
            const sis = sisters[i] || { age: "", profession: "", kidsCount: "", illness: "" };

            payload.push({
                donorId: donorId,
                brotherAge: bro.age,
                brotherProfession: bro.profession,
                brotherKidsCount: bro.kidsCount,
                brotherIllness: bro.illness,
                sisterAge: sis.age,
                sisterProfession: sis.profession,
                sisterKidsCount: sis.kidsCount,
                sisterIllness: sis.illness
            });
        }

        try {
            await axiosInstance.put("updateDonorFamilyInfo", payload);
            toast.success("Family Information Updated!");
        } catch (error) {
            toast.error("Update failed.");
        } finally { setLoading(false); }
    };

    const updateBlood = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axiosInstance.put("updateDonorBloodReport", bloodReports);
            toast.success("Blood Reports Updated!");
        } catch (error) {
            toast.error("Update failed.");
        } finally { setLoading(false); }
    };

    const updateSemen = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axiosInstance.put("updateSemenReport", semenReport);
            toast.success("Semen Report Updated!");
        } catch (error) {
            toast.error("Update failed.");
        } finally { setLoading(false); }
    };

    const updateSample = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axiosInstance.put("updateSampleReport", sampleReport);
            toast.success("Sample Report Updated!");
        } catch (error) {
            toast.error("Update failed.");
        } finally { setLoading(false); }
    };


    // --- RENDER FUNCTIONS ---

    const renderPersonalInformation = () => (
        <form onSubmit={updatePersonal} className="space-y-6">
            <div className="flex justify-end mb-4">
                <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                    {loading ? "Updating..." : "Update Personal Info"}
                </button>
            </div>

            {/* Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="border p-4 rounded bg-gray-50 flex flex-col items-center">
                    <span className="text-sm font-bold text-gray-700 mb-2">Selfie Image</span>
                    {personalInfo.selfeImage ? (
                        <img src={`data:image/jpeg;base64,${personalInfo.selfeImage}`} alt="Selfie" className="h-40 w-40 object-cover rounded-full border-2 border-blue-200 mb-3" />
                    ) : <div className="h-40 w-40 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 mb-3">No Image</div>}
                    <label className="cursor-pointer bg-white border border-gray-300 rounded px-3 py-1 text-sm hover:bg-gray-50 shadow-sm">
                        Choose File <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'selfeImage')} />
                    </label>
                </div>
                <div className="border p-4 rounded bg-gray-50 flex flex-col items-center">
                    <span className="text-sm font-bold text-gray-700 mb-2">Full Length Image</span>
                    {personalInfo.fullLengthImage ? (
                        <img src={`data:image/jpeg;base64,${personalInfo.fullLengthImage}`} alt="Full Length" className="h-40 w-auto object-contain border border-gray-200 mb-3" />
                    ) : <div className="h-40 w-40 bg-gray-200 flex items-center justify-center text-gray-400 mb-3">No Image</div>}
                    <label className="cursor-pointer bg-white border border-gray-300 rounded px-3 py-1 text-sm hover:bg-gray-50 shadow-sm">
                        Choose File <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'fullLengthImage')} />
                    </label>
                </div>
            </div>

            {/* Personal Details */}
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Personal Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormInput label="Name" name="name" value={personalInfo.name} onChange={(e) => handleObjectChange(e, setPersonalInfo)} />
                    <FormInput label="Age" name="age" value={personalInfo.age} onChange={(e) => handleObjectChange(e, setPersonalInfo)} type="number" />
                    <FormInput label="DOB" name="dateOfBirth" type="date" value={personalInfo.dateOfBirth} onChange={(e) => handleObjectChange(e, setPersonalInfo)} />
                    <FormInput label="Adhar No" name="adharCardNo" value={personalInfo.adharCardNo} onChange={(e) => handleObjectChange(e, setPersonalInfo)} />
                    <FormSelect label="Married" name="marriedStatus" value={marriedOptions.find(o => o.value === personalInfo.marriedStatus)} options={marriedOptions} onChange={(o) => handleSelectChange(o, 'marriedStatus', setPersonalInfo)} />
                    <FormInput label="Male Kids" name="maleKidsCount" value={personalInfo.maleKidsCount} onChange={(e) => handleObjectChange(e, setPersonalInfo)} type="number" />
                    <FormInput label="Female Kids" name="femaleKidsCount" value={personalInfo.femaleKidsCount} onChange={(e) => handleObjectChange(e, setPersonalInfo)} type="number" />
                    <FormInput label="Height" name="height" value={personalInfo.height} onChange={(e) => handleObjectChange(e, setPersonalInfo)} type="number" step="0.1" />
                    <FormInput label="Weight" name="weight" value={personalInfo.weight} onChange={(e) => handleObjectChange(e, setPersonalInfo)} type="number" step="0.1" />
                    <FormSelect label="Skin Color" name="skinColor" value={skinColorOptions.find(o => o.value === personalInfo.skinColor)} options={skinColorOptions} onChange={(o) => handleSelectChange(o, 'skinColor', setPersonalInfo)} />
                    <FormSelect label="Eye Color" name="eyeColor" value={eyeColorOptions.find(o => o.value === personalInfo.eyeColor)} options={eyeColorOptions} onChange={(o) => handleSelectChange(o, 'eyeColor', setPersonalInfo)} />
                    <FormSelect label="Education" name="education" value={educationOptions.find(o => o.value === personalInfo.education)} options={educationOptions} onChange={(o) => handleSelectChange(o, 'education', setPersonalInfo)} />
                    <FormInput label="Profession" name="profession" value={personalInfo.profession} onChange={(e) => handleObjectChange(e, setPersonalInfo)} />
                    <FormInput label="Religion" name="religion" value={personalInfo.religion} onChange={(e) => handleObjectChange(e, setPersonalInfo)} />
                </div>
            </div>

            {/* Address */}
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Address & Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormInput label="Address" name="address" value={personalInfo.address} onChange={(e) => handleObjectChange(e, setPersonalInfo)} />
                    <FormInput label="City" name="city" value={personalInfo.city} onChange={(e) => handleObjectChange(e, setPersonalInfo)} />
                    <FormInput label="Pincode" name="pincode" value={personalInfo.pincode} onChange={(e) => handleObjectChange(e, setPersonalInfo)} />
                    <FormInput label="Mobile" name="phoneNumber" value={personalInfo.phoneNumber} onChange={(e) => handleObjectChange(e, setPersonalInfo)} />
                    <FormInput label="Email" name="email" value={personalInfo.email} onChange={(e) => handleObjectChange(e, setPersonalInfo)} />
                </div>
            </div>

            {/* Medical History */}
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Medical History</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border p-3 rounded">
                        <FormSelect label="Hospital Admission" name="hospitalAdmissionStatus" value={statusOptions.find(o => o.value === personalInfo.hospitalAdmissionStatus)} options={statusOptions} onChange={(o) => handleSelectChange(o, 'hospitalAdmissionStatus', setPersonalInfo)} />
                        {personalInfo.hospitalAdmissionStatus && <FormTextarea label="Reason" name="hospitalAdmissionReason" value={personalInfo.hospitalAdmissionReason} onChange={(e) => handleObjectChange(e, setPersonalInfo)} rows={2} />}
                    </div>
                    <div className="border p-3 rounded">
                        <FormSelect label="Surgery" name="surgeryStatus" value={statusOptions.find(o => o.value === personalInfo.surgeryStatus)} options={statusOptions} onChange={(o) => handleSelectChange(o, 'surgeryStatus', setPersonalInfo)} />
                        {personalInfo.surgeryStatus && <FormTextarea label="Reason" name="surgeryReason" value={personalInfo.surgeryReason} onChange={(e) => handleObjectChange(e, setPersonalInfo)} rows={2} />}
                    </div>
                    <div className="border p-3 rounded">
                        <FormSelect label="Blood Donation" name="bloodDonationStatus" value={statusOptions.find(o => o.value === personalInfo.bloodDonationStatus)} options={statusOptions} onChange={(o) => handleSelectChange(o, 'bloodDonationStatus', setPersonalInfo)} />
                        {personalInfo.bloodDonationStatus && <FormTextarea label="Reason" name="bloodDonationReason" value={personalInfo.bloodDonationReason} onChange={(e) => handleObjectChange(e, setPersonalInfo)} rows={2} />}
                    </div>
                    <div className="border p-3 rounded">
                        <FormSelect label="Prolonged Illness" name="prolongedIllnessStatus" value={statusOptions.find(o => o.value === personalInfo.prolongedIllnessStatus)} options={statusOptions} onChange={(o) => handleSelectChange(o, 'prolongedIllnessStatus', setPersonalInfo)} />
                        {personalInfo.prolongedIllnessStatus && <FormTextarea label="Reason" name="prolongedIllnessReason" value={personalInfo.prolongedIllnessReason} onChange={(e) => handleObjectChange(e, setPersonalInfo)} rows={2} />}
                    </div>
                </div>
            </div>
        </form>
    );

    const renderFamilyInformation = () => {
        // --- Brother Logic ---
        const handleBrotherChange = (index, e) => {
            const list = [...brothers];
            list[index][e.target.name] = e.target.value;
            setBrothers(list);
        };
        const addBrother = () => setBrothers([...brothers, { age: "", profession: "", kidsCount: "", illness: "" }]);
        const removeBrother = async (index, donorFamailyId) => {
            try {
                await axiosInstance.delete(`deleteDonorFamilyInfo/${donorFamailyId}`);
                toast.success("Info Deleted");
            } catch (error) {
                toast.error("Update failed.");
            }
            const list = [...brothers];
            list.splice(index, 1);
            setBrothers(list);
        };

        // --- Sister Logic ---
        const handleSisterChange = (index, e) => {
            const list = [...sisters];
            list[index][e.target.name] = e.target.value;
            setSisters(list);
        };
        const addSister = () => setSisters([...sisters, { age: "", profession: "", kidsCount: "", illness: "" }]);
        const removeSister = (index) => {
            const list = [...sisters];
            list.splice(index, 1);
            setSisters(list);
        };

        return (
            <form onSubmit={updateFamily} className="space-y-6">
                <div className="flex justify-end mb-4">
                    <button type="submit" disabled={loading} className="text-sm bg-blue-600 text-white px-4 py-2 rounded">Update Family Info</button>
                </div>

                {/* BROTHERS SECTION */}
                <div className="bg-gray-50 p-4 rounded border">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="text-lg font-semibold text-blue-700">Brothers</h3>
                        <button type="button" onClick={addBrother} className="text-sm bg-green-500 text-white px-3 py-1 rounded">+ Add Brother</button>
                    </div>
                    {brothers.map((item, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 items-end">
                            <FormInput label="Age" name="age" value={item.age} onChange={(e) => handleBrotherChange(index, e)} type="number" />
                            <FormInput label="Profession" name="profession" value={item.profession} onChange={(e) => handleBrotherChange(index, e)} />
                            <FormInput label="Kids" name="kidsCount" value={item.kidsCount} onChange={(e) => handleBrotherChange(index, e)} type="number" />
                            <FormInput label="Illness" name="illness" value={item.illness} onChange={(e) => handleBrotherChange(index, e)} />
                            <button type="button" onClick={() => removeBrother(index, item.donorFamailyId)} className="text-red-500 hover:text-red-700 text-sm font-medium mb-2 border border-red-200 px-2 py-1 rounded bg-white">Remove</button>
                        </div>
                    ))}
                    {brothers.length === 0 && <p className="text-sm text-gray-500">No brothers added.</p>}
                </div>

                {/* SISTERS SECTION */}
                <div className="bg-gray-50 p-4 rounded border">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="text-lg font-semibold text-pink-700">Sisters</h3>
                        <button type="button" onClick={addSister} className="text-sm bg-green-500 text-white px-3 py-1 rounded">+ Add Sister</button>
                    </div>
                    {sisters.map((item, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 items-end">
                            <FormInput label="Age" name="age" value={item.age} onChange={(e) => handleSisterChange(index, e)} type="number" />
                            <FormInput label="Profession" name="profession" value={item.profession} onChange={(e) => handleSisterChange(index, e)} />
                            <FormInput label="Kids" name="kidsCount" value={item.kidsCount} onChange={(e) => handleSisterChange(index, e)} type="number" />
                            <FormInput label="Illness" name="illness" value={item.illness} onChange={(e) => handleSisterChange(index, e)} />
                            <button type="button" onClick={() => removeSister(index)} className="text-red-500 hover:text-red-700 text-sm font-medium mb-2 border border-red-200 px-2 py-1 rounded bg-white">Remove</button>
                        </div>
                    ))}
                    {sisters.length === 0 && <p className="text-sm text-gray-500">No sisters added.</p>}
                </div>
            </form>
        );
    };

    const renderBloodReports = () => {
        const handleBloodChange = (index, e) => {
            const list = [...bloodReports];
            list[index][e.target.name] = e.target.value;
            setBloodReports(list);
        };
        const addReport = () => setBloodReports([...bloodReports, { donorId: donorId, reportDateTime: "", bloodGroup: "", bsl: "", reportType: "", hiv: "", hbsag: "", vdrl: "", hcv: "", hbelectrophoresis: "", srcreatinine: "", cmv: "" }]);
        const removeReport = async (index,bloodReportId) => {
               try {
            await axiosInstance.delete(`deleteDonorBloodReport/${bloodReportId}`);
            toast.success("Sample Report Updated!");
        } catch (error) {
            toast.error("Update failed.");
        }
            const list = [...bloodReports];
            list.splice(index, 1);
            setBloodReports(list);
        };

        return (
            <form onSubmit={updateBlood} className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Blood Reports</h3>
                    <div className="flex gap-2">
                        <button type="button" onClick={addReport} className="text-sm bg-green-500 text-white px-3 py-2 rounded">+ Add Report</button>
                        <button type="submit" disabled={loading} className="text-sm bg-blue-600 text-white px-4 py-2 rounded">Update Blood Reports</button>
                    </div>
                </div>
                {bloodReports.map((report, index) => (
                    <div key={index} className="border p-4 rounded bg-gray-50 grid grid-cols-1 md:grid-cols-4 gap-4 relative mb-4">
                        <div className="md:col-span-4 flex justify-between font-bold text-gray-500 border-b pb-1 mb-2">
                            <span>Report #{index + 1}</span>
                            <button type="button" onClick={() => removeReport(index,report.donorBloodReportId)} className="text-red-500 text-xs">Remove</button>
                        </div>
                        <FormInput label="Date & Time" name="reportDateTime" type="datetime-local" value={report.reportDateTime} onChange={(e) => handleBloodChange(index, e)} />
                        <FormInput label="Report Type" name="reportType" value={report.reportType} onChange={(e) => handleBloodChange(index, e)} />
                        <FormInput label="Blood Group" name="bloodGroup" value={report.bloodGroup} onChange={(e) => handleBloodChange(index, e)} />
                        <FormInput label="BSL" name="bsl" value={report.bsl} onChange={(e) => handleBloodChange(index, e)} />
                        <FormInput label="HIV" name="hiv" value={report.hiv} onChange={(e) => handleBloodChange(index, e)} />
                        <FormInput label="HBSAG" name="hbsag" value={report.hbsag} onChange={(e) => handleBloodChange(index, e)} />
                        <FormInput label="VDRL" name="vdrl" value={report.vdrl} onChange={(e) => handleBloodChange(index, e)} />
                        <FormInput label="HCV" name="hcv" value={report.hcv} onChange={(e) => handleBloodChange(index, e)} />
                        <FormInput label="HB Electrophoresis" name="hbelectrophoresis" value={report.hbelectrophoresis} onChange={(e) => handleBloodChange(index, e)} />
                        <FormInput label="SR. Creatinine" name="srcreatinine" value={report.srcreatinine} onChange={(e) => handleBloodChange(index, e)} />
                        <FormInput label="CMV" name="cmv" value={report.cmv} onChange={(e) => handleBloodChange(index, e)} />
                    </div>
                ))}
            </form>
        );
    };

    const renderSemenReport = () => (
        <form onSubmit={updateSemen} className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Semen Analysis Report</h3>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Update Semen Report</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput label="Date & Time" name="dateAndTime" type="datetime-local" value={semenReport.dateAndTime} onChange={(e) => handleObjectChange(e, setSemenReport)} />
                <FormInput label="Media" name="media" value={semenReport.media} onChange={(e) => handleObjectChange(e, setSemenReport)} />
                <FormInput label="Volume" name="volumne" value={semenReport.volumne} onChange={(e) => handleObjectChange(e, setSemenReport)} type="number" />
                <FormInput label="Concentration" name="spermConcentration" value={semenReport.spermConcentration} onChange={(e) => handleObjectChange(e, setSemenReport)} />
                <FormInput label="Million/ML" name="million" value={semenReport.million} onChange={(e) => handleObjectChange(e, setSemenReport)} type="number" />
                <FormInput label="Morphology" name="morphology" value={semenReport.morphology} onChange={(e) => handleObjectChange(e, setSemenReport)} />

                <div className="md:col-span-3 border p-3 rounded bg-gray-50">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Progressive Motility (%)</label>
                    <div className="grid grid-cols-3 gap-4">
                        <FormInput label="A %" name="progressiveMotilityA" value={semenReport.progressiveMotilityA} onChange={(e) => handleObjectChange(e, setSemenReport)} type="number" />
                        <FormInput label="B %" name="progressiveMotilityB" value={semenReport.progressiveMotilityB} onChange={(e) => handleObjectChange(e, setSemenReport)} type="number" />
                        <FormInput label="C %" name="progressiveMotilityC" value={semenReport.progressiveMotilityC} onChange={(e) => handleObjectChange(e, setSemenReport)} type="number" />
                    </div>
                </div>

                <div className="md:col-span-3">
                    <FormTextarea label="Abnormality" name="abnormality" value={semenReport.abnormality} onChange={(e) => handleObjectChange(e, setSemenReport)} rows={3} />
                </div>
            </div>
        </form>
    );

    const renderSampleReport = () => (
        <form onSubmit={updateSample} className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Sample Storage Details</h3>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Update Sample Report</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput label="Tank No" name="tankNo" value={sampleReport.tankNo} onChange={(e) => handleObjectChange(e, setSampleReport)} />
                <FormInput label="Cane No" name="caneNo" value={sampleReport.caneNo} onChange={(e) => handleObjectChange(e, setSampleReport)} />
                <FormInput label="Canister No" name="canisterNo" value={sampleReport.canisterNo} onChange={(e) => handleObjectChange(e, setSampleReport)} />
                <FormInput label="No. of Vials" name="numberOfVials" type="number" value={sampleReport.numberOfVials} onChange={(e) => handleObjectChange(e, setSampleReport)} />
                <FormInput label="Balanced Vials" name="balancedVials" type="number" value={sampleReport.balancedVials} onChange={(e) => handleObjectChange(e, setSampleReport)} />
                <div className="md:col-span-3">
                    <FormTextarea label="Remarks" name="remarks" value={sampleReport.remarks} onChange={(e) => handleObjectChange(e, setSampleReport)} rows={3} />
                </div>
            </div>
        </form>
    );

    const renderTabContent = () => {
        if (loading && Object.keys(personalInfo).length === 0) return <div className="p-4 text-center">Loading...</div>;

        switch (activeTab) {
            case "personal": return renderPersonalInformation();
            case "family": return renderFamilyInformation();
            case "blood": return renderBloodReports();
            case "semen": return renderSemenReport();
            case "sample": return renderSampleReport();
            default: return renderPersonalInformation();
        }
    };

    return (
        <LayoutComponent>
            <div className="p-4 bg-gray-50 border-b border-gray-200 overflow-x-auto h-[90vh] overflow-y-auto CRM-scroll-width-none">
                <div className="">
                    <div className="flex items-center gap-2 mb-2">
                        <button
                            onClick={() => {
                                if (role === "ROLE_ADMIN") navigate("/Admin/donarList");
                                else if (role === "ROLE_EMPLOYEE") navigate("/Employee/donarList");
                            }}
                            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Donor List
                        </button>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Edit Donor</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-4 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium"
                            >
                                Back
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto h-[72vh] CRM-scroll-width-none mt-4">
                    <div className="p-4">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="border-b border-gray-200">
                                <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500">
                                    {tabs.map((tab) => (
                                        <li key={tab.id} className="me-2">
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`inline-block p-4 rounded-t-lg transition-colors duration-200 ${activeTab === tab.id
                                                        ? "text-blue-600 bg-blue-50 border-b-2 border-blue-600"
                                                        : "hover:text-gray-700 hover:bg-gray-50"
                                                    }`}
                                            >
                                                {tab.label}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="p-6">
                                {renderTabContent()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </LayoutComponent>
    );
}

export default EditDonar;