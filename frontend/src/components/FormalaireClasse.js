import React, { useState } from 'react';
import axiosInstance from '../api/axiosConfig';

const FormulaireClasse = () => {
  const [formData, setFormData] = useState({
    nom: '',
    matiere: '',
    niveau: '',
  });

  const [erreurs, setErreurs] = useState({});
  const [succes, setSucces] = useState(false);

  const valider = () => {
    const newErreurs = {};
    if (!formData.nom) newErreurs.nom = 'Le nom est obligatoire';
    if (!formData.matiere) newErreurs.matiere = 'La matière est obligatoire';
    if (!formData.niveau) newErreurs.niveau = 'Le niveau est obligatoire';
    return newErreurs;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErreurs = valider();
    if (Object.keys(newErreurs).length > 0) {
      setErreurs(newErreurs);
      return;
    }
    try {
      await axiosInstance.post('/api/classes/', formData);
      setSucces(true);
      setFormData({ nom: '', matiere: '', niveau: '' });
      setErreurs({});
    } catch (error) {
      console.error('Erreur création classe:', error);
    }
  };

  return (
    <div>
      <h2>Créer une classe</h2>
      {succes && <p style={{color: 'green'}}>Classe créée avec succès !</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nom de la classe</label>
          <input
            type="text"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            placeholder="Ex: Mathématiques"
          />
          {erreurs.nom && <p style={{color: 'red'}}>{erreurs.nom}</p>}
        </div>
        <div>
          <label>Matière</label>
          <input
            type="text"
            name="matiere"
            value={formData.matiere}
            onChange={handleChange}
            placeholder="Ex: Mathématiques"
          />
          {erreurs.matiere && <p style={{color: 'red'}}>{erreurs.matiere}</p>}
        </div>
        <div>
          <label>Niveau</label>
          <input
            type="text"
            name="niveau"
            value={formData.niveau}
            onChange={handleChange}
            placeholder="Ex: Licence 1"
          />
          {erreurs.niveau && <p style={{color: 'red'}}>{erreurs.niveau}</p>}
        </div>
        <button type="submit">Créer la classe</button>
      </form>
    </div>
  );
};

export default FormulaireClasse;