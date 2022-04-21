import { query } from "./db";
import { TimeReport } from "../types";

type getTimeReportFilter = {
    email?: string;
    year?: number;
    month?: number;
    project?: string;
};

import TimeReportModel, {TimeReportType} from "./models/timereport";
export const getTimeReport = async ({email,year,month,project}: getTimeReportFilter) => {
    let params = {};
    if (email) {
        params['email'] = email ;
    }
    if (year && !month) {
        params['time'] = {$gt: new Date(year, 0, 1), $lt: new Date(Number(year) + 1, 0, 1)} 
    }
    if (month && year) {
        params['time'] = {$gt: new Date(year, month-1, 1), $lt: new Date(year, month, 1)}
    }
    if (project) {
        params['project'] = project;
    }
    const timereports = await TimeReportModel.find(params).lean()
    return timereports
}


export const getTimeReportById = async (timeReportId: string) => {
    const timeReport = await TimeReportModel.findById(timeReportId)
    console.log('HÄR ÄR TIMEREPORT', timeReport)
    return timeReport
};

export const deleteTimeReportById = async (timeReportId: string) => {
    const test = await TimeReportModel.findByIdAndDelete(timeReportId)

// All CRUD-operations that needs a correct ID as a parameter gets a string with value 'undefined' from the client side application.
    return test
};


export const getTimeReportMeta = async (email: string) => {
    const res = await TimeReportModel.aggregate([ {$match: {'email': email}},{ $group: { _id: { year: { $year: "$time" }, month: { $month: "$time" } } } }]).exec()
    return (await res).map(meta => ({ year: Number(meta._id.year), month: Number(meta._id.month) }) );
  }

export const addTimeReport = (timeReport: TimeReportType) => {
    const newTimeReport = new TimeReportModel(
        {
            email: timeReport.email,
            time: timeReport.time,
            description: timeReport.description,
            hours: timeReport.hours,
            project_id: timeReport.project_id,
        }
      );
      return newTimeReport.save().then((res) => [res]);
    
    }

export const updateTimeReport = (timeReport: TimeReportType) => {
    return TimeReportModel.findByIdAndUpdate(timeReport._id, {
        email: timeReport.email,
        time: timeReport.time,
        description: timeReport.description,
        hours: timeReport.hours,
        project_id: timeReport.project_id,
    }).then((res) => [res]);
}