import {
  createCountry,
  createDepartment,
  createJobTitle,
  deleteCountry,
  deleteDepartment,
  deleteJobTitle,
  listCountries,
  listDepartments,
  listJobTitles,
  updateCountry,
  updateDepartment,
  updateJobTitle
} from "../api/lookups.js";

const lookupConfig = {
  departments: {
    title: "Departments",
    singular: "Department",
    subtitle: "Manage organizational departments used in employee profiles.",
    indexPath: "/departments",
    newPath: "/departments/new",
    list: listDepartments,
    create: createDepartment,
    update: updateDepartment,
    delete: deleteDepartment
  },
  jobTitles: {
    title: "Job Titles",
    singular: "Job Title",
    subtitle: "Manage job titles assigned to employees.",
    indexPath: "/job-titles",
    newPath: "/job-titles/new",
    list: listJobTitles,
    create: createJobTitle,
    update: updateJobTitle,
    delete: deleteJobTitle
  },
  countries: {
    title: "Countries",
    singular: "Country",
    subtitle: "Manage countries available for employee location data.",
    indexPath: "/countries",
    newPath: "/countries/new",
    list: listCountries,
    create: createCountry,
    update: updateCountry,
    delete: deleteCountry
  }
};

export default lookupConfig;
