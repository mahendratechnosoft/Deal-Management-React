import React, { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import RoleBasedRoute from "../Components/BaseComponet/RoleBasedRoute";
const LeadList = lazy(() => import("../Components/Common/Lead/LeadList"));
const CreateLead = lazy(() => import("../Components/Common/Lead/CreateLead"));
const EditLead = lazy(() => import("../Components/Common/Lead/EditLead"));
const CustomerList = lazy(() =>
  import("../Components/Common/Customer/CustomerList")
);
const CreateCustomer = lazy(() =>
  import("../Components/Common/Customer/CreateCustomer")
);
const EditCustomer = lazy(() =>
  import("../Components/Common/Customer/EditCustomer")
);
const PaymentList = lazy(() =>
  import("../Components/Common/Payment/PaymentList")
);
const EditPayment = lazy(() =>
  import("../Components/Common/Payment/EditPayment")
);
const DonorList = lazy(() => import("../Components/Common/Donor/DonorList"));
const EditDonar = lazy(() => import("../Components/Common/Donor/EditDonar"));
const SelectedDonarList = lazy(() =>
  import("../Components/Common/Donor/SelectedDonarList")
);
const FamilyList = lazy(() => import("../Components/Common/Donor/FamilyList"));
const DonorMatchingFilter = lazy(() =>
  import("../Components/Common/Donor/DonorMatchingFilter")
);
const EditFamily = lazy(() => import("../Components/Common/Donor/EditFamily"));
const ProposalList = lazy(() =>
  import("../Components/Common/Proposal/ProposalList")
);
const ProformaList = lazy(() =>
  import("../Components/Common/Proforma/ProformaList")
);
const TimeSheetList = lazy(() =>
  import("../Components/Common/Timesheet/TimeSheetList")
);
const InvoiceList = lazy(() =>
  import("../Components/Common/Invoice/InvoiceList")
);
const ItemList = lazy(() => import("../Components/Common/Item/Itemlists"));
const TaskList = lazy(() => import("../Components/Common/Task/TaskList"));
const AmcList = lazy(() => import("../Components/Common/AMC/AmcList"));
const VendorContactList = lazy(() =>
  import("../Components/Common/Vendor/VendorContact/VendorContactList")
);
const VendorList = lazy(() => import("../Components/Common/Vendor/VendorList"));
const SemenEnquiryList = lazy(() =>
  import("../Components/Common/Donor/SemenEnquiryList")
);
const EditSemenEnquiry = lazy(() =>
  import("../Components/Common/Donor/EditSemenEnquiry")
);
const ComplianceList = lazy(() =>
  import("../Components/Common/ContactPannel/Compliance/ComplianceList")
);

const EmployeeRoutes = () => {
  return (
    <RoleBasedRoute allowedRoles={["ROLE_EMPLOYEE"]}>
      <Routes>
        <Route path="LeadList" element={<LeadList />} />
        <Route path="CreateLead" element={<CreateLead />} />
        <Route path="EditLead/:id" element={<EditLead />} />
        <Route path="CustomerList" element={<CustomerList />} />
        <Route path="CreateCustomer" element={<CreateCustomer />} />
        <Route path="EditCustomer/:customerId" element={<EditCustomer />} />
        <Route path="Payment" element={<PaymentList />} />
        <Route path="EditPayment/:paymentId" element={<EditPayment />} />
        <Route path="DonorList" element={<DonorList />} />
        <Route path="DonorEdit/:donorId" element={<EditDonar />} />
        <Route path="DonorList/:pageName" element={<SelectedDonarList />} />
        <Route path="FamilyList" element={<FamilyList />} />
        <Route
          path="PreviewMatchingDonors/:familyId"
          element={<DonorMatchingFilter />}
        />
        <Route path="EditFamily/:familyInfoId" element={<EditFamily />} />

        <Route path="Proposal" element={<ProposalList />} />
        <Route path="Proforma" element={<ProformaList />} />
        <Route path="TimesheetList" element={<TimeSheetList />} />
        <Route path="Invoice" element={<InvoiceList />} />
        <Route path="ItemList" element={<ItemList />} />
        <Route path="TaskList" element={<TaskList />} />
        <Route path="AMC" element={<AmcList />} />
        <Route
          path="VendorContactList/:vendorId"
          element={<VendorContactList />}
        />
        <Route path="VendorList" element={<VendorList />} />
        <Route path="SemenEnquiryList" element={<SemenEnquiryList />} />
        <Route path="EditSemenEnquiry/:id" element={<EditSemenEnquiry />} />
        <Route path="ComplianceList" element={<ComplianceList />} />
      </Routes>
    </RoleBasedRoute>
  );
};

export default EmployeeRoutes;
