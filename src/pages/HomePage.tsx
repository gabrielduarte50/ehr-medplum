import { Button, Loader } from '@mantine/core';
import { formatGivenName } from '@medplum/core';
import { HumanName, Patient, Practitioner } from '@medplum/fhirtypes';
import { Document, ResourceBadge, useMedplum, useMedplumProfile } from '@medplum/react';
import React , {useCallback, useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import {getPatient} from '../pages/services/patientService'

export function HomePage(): JSX.Element {

  const profile = useMedplumProfile() as Practitioner;
  const [patient, setPatient] = useState<Patient>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        let response = await getPatient("7079776");
        if(response.success) {
          setPatient(JSON.parse(response.data));
        }
      } catch (error) {
       //pass
      }  
    };

    fetchData();
  }, []);

  if (!patient) {
    return <Loader />;
  }

  return (
    <Document>
      <h1>Bem-vindo {formatGivenName(profile.name?.[0] as HumanName)}</h1>
      <h3>Para ver os detalhes de atividade física, clique sobre o nome</h3>
      <h3>Patients</h3>
      <Link to={"/patient"} ><div>{patient?.name?.[0].text}</div></Link>
    </Document>
  );
}
