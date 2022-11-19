import api from '../../core/api';

export const getPatient = async (idPatient: string) =>  {
    const response = await api.get(`Patient?patientId=${idPatient}`);
    return response.data;
}

export const getObservationByPeriod = async (idPatient: string | undefined, startDate : string, endDate: string) =>  { 
    const response = await api.post(`Observation?patientId=${idPatient}&startDate=${startDate}&endDate=${endDate}`);
    return response.data;
}
