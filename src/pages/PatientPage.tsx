import { ResourceAvatar, ResourceName, Document,  DateTimeInput, ResourceTable } from '@medplum/react';
import React, { Suspense, useEffect, useState } from 'react';
import { getObservationByPeriod, getPatient } from '../pages/services/patientService'
import { Button} from '@mantine/core';
import './PatientPage.css';
import {  Patient, Observation } from '@medplum/fhirtypes';
import getLocaleDate from './services/helpers';

export const backgroundColor = 'rgba(29, 112, 214, 0.7)';
export const borderColor = 'rgba(29, 112, 214, 1)';
export const secondBackgroundColor = 'rgba(255, 119, 0, 0.7)';
export const secondBorderColor = 'rgba(255, 119, 0, 1)';
interface chartDataType {
  labels: (string | null | undefined)[];
  datasets: {
    label: string;
    data: (number | undefined)[];
    backgroundColor: string;
    borderColor?: string;
  }[];
}
interface measurementsMetaType {
  [key: string]: {
    id: string;
    code: string;
    title: string;
    description: string;
    chartDatasets: {
      label: string;
      backgroundColor: string;
      borderColor: string;
    }[];
  };
}

const INITIALTYPE : chartDataType = {
  labels : [''],
    datasets : [{
      label : '',
      data : [123],
      backgroundColor : backgroundColor,
      borderColor : borderColor,
  }]
};

export const measurementsMeta: measurementsMetaType = {
  
  'calories-burned': {
    id: 'calories-burned',
    code: '41981-2',
    title: 'Calorias queimadas - (Kcal)',
    description: 'Your Calories burned values',
    chartDatasets: [
      {
        label: 'Calorias queimadas em (kcal)',
        backgroundColor,
        borderColor,
      },
    ],
  },
 
  'total-passos': {
    id: 'total-passos',
    code: '248263006',
    title: 'Total de passos',
    description: 'Your Total de passos values',
    chartDatasets: [
      {
        label: 'Total de passos',
        backgroundColor,
        borderColor,
      },
    ],
  },
  'heart-rate': {
    id: 'heart-rate',
    code: '8867-4',
    title: 'Frequência Cardíaca - (/min)',
    description: 'Your heart rate values',
    chartDatasets: [
      {
        label: 'Frequência cardíaca em (/min)',
        backgroundColor,
        borderColor,
      },
    ],
  },
};


export function PatientPage(): JSX.Element {
  
  const [patient, setPatient] = useState<Patient>();
  const [resObs, setResObs] = useState<Observation[]>([]);
  
  const [startDate, setStartDate] = useState(new Date().toLocaleDateString('pt-BR'));
  const [endDate, setEndDate] = useState(new Date().toLocaleDateString('pt-BR'));

  const [chartDataHeart, setChartDataHeart] = useState<chartDataType>(INITIALTYPE);
  const [chartDataCalories, setChartDataCalories] = useState<chartDataType>(INITIALTYPE);
  const [chartDataSteps, setChartDataSteps] = useState<chartDataType>(INITIALTYPE);
  
  const fetchData = async () => {
    try {
        await getPatient("7079769").then(response =>{
        setPatient(JSON.parse(response.data));
      });
    } catch (error) {
     //pass
    }  
  };
  useEffect(() => {
    fetchData();
  },[]);

  const getObservationPatient = async () => {
    await getObservationByPeriod(patient?.id, startDate, endDate).then((value) => {
      setResObs(value.data.map((i: string) => JSON.parse(i)))}
    );
  
  }

  useEffect(() => {
    setChart();
  },[resObs]);
 
  const getDatasets = (index: number, code: string, measurements?: Observation[]): (number | undefined)[] => {
    if (measurements) {
      return measurements.filter(m => m.code?.coding?.at(0)?.code == code).map(({ valueQuantity }) =>
      valueQuantity?.value 
     );
    }
    return [];
  };

  function setChart(){ 
    const labels = resObs.map(({ effectivePeriod}) => {
       return  getLocaleDate(effectivePeriod?.start);
    }).filter(function(elem, pos, self) {
      return self.indexOf(elem) == pos;
    });
    
    setChartDataHeart({
      labels : labels,
      datasets: measurementsMeta['heart-rate' as string].chartDatasets.map((item, i) => ({
        ...item,
        data: getDatasets(i, measurementsMeta['heart-rate' as string].code, resObs), 
      })),
    });

    setChartDataCalories({
      labels :labels,
      datasets: measurementsMeta['calories-burned' as string].chartDatasets.map((item, i) => ({
        ...item,
        data: getDatasets(i,measurementsMeta['calories-burned' as string].code, resObs), 
      })),
    });

    setChartDataSteps({
      labels : labels,
      datasets: measurementsMeta['total-passos' as string].chartDatasets.map((item, i) => ({
        ...item,
        data: getDatasets(i,measurementsMeta['total-passos' as string].code, resObs), 
      })),
    });

  }

  const LineChart = React.lazy(() => import('../../src/pages/LineChart'));

return (
  <div className="patient-page">
    <div className="patient-sidebar">
    <Document>
        <div className="patient-title">
          <ResourceAvatar value={patient} />
          <ResourceName value={patient} />
        </div>
        <h3>Nome</h3>
        <div>{patient?.name?.[0].text}</div>
        <h3>Data de nascimento</h3>
        <div>{patient?.birthDate}</div>
        <h3>Gênero</h3>
        <div>{patient?.gender}</div>
        <h3>Data de Criação</h3> 
        <div>{patient?.meta?.lastUpdated}</div> 
        </Document>
      </div>
    

    <section >
     <Document>
      <div>
          <h3>Observações</h3>
          <h4>Selecione o período para obter dados de atividade física</h4>
          <p>Data inicial</p>
          <DateTimeInput name="startDate" 
            onChange={(date) => {
                let d = new Date(date).toISOString().slice(0, 10);
                setStartDate(d);
              }}/>
          <p>Data final</p>
          <DateTimeInput name="endDate"
            onChange={(date) => {
              let d = new Date(date).toISOString().slice(0, 10);
              setEndDate(d);
            }} />
          <>
          <Button onClick={getObservationPatient}>Obter dados</Button>
          </>
        </div>
      </Document>
    </section>
    <section className="patient-observation">
    {resObs && (
      <>
          <h3>Frequência Cardíaca</h3>
            <Suspense fallback={null}>
              <LineChart chartData={chartDataHeart} />
            </Suspense>
            <h3>Calorias Queimadas</h3>
            <Suspense fallback={null}>
              <LineChart chartData={chartDataCalories} />
            </Suspense>
            <h3>Total de Passos</h3>
            <Suspense fallback={null}>
             <LineChart chartData={chartDataSteps} />
            </Suspense>
            </>
            )}
    </section>
  </div>
);
}
