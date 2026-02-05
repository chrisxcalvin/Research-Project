"""
Risk Analysis Engine for MediLens-360
Checks medicines against patient profile for potential risks.
"""

# Simplified database of drug-allergy associations
ALLERGY_DRUG_MAP = {
    "penicillin": ["amoxicillin", "ampicillin", "penicillin", "augmentin", "clavulanate"],
    "sulfa drugs": ["sulfamethoxazole", "trimethoprim", "bactrim", "septra"],
    "aspirin": ["aspirin", "acetylsalicylic acid", "disprin"],
    "ibuprofen": ["ibuprofen", "advil", "motrin", "brufen"],
    "codeine": ["codeine", "co-codamol", "tylenol 3"],
}

# Drugs that affect blood sugar - relevant for diabetics
BLOOD_SUGAR_AFFECTING_DRUGS = {
    "increase_sugar": ["prednisone", "prednisolone", "dexamethasone", "metformin", "hydrocortisone"],
    "decrease_sugar": ["insulin", "glipizide", "glyburide", "metformin", "glimepiride"],
}

# Drugs to be cautious with in certain conditions
CONDITION_DRUG_WARNINGS = {
    "diabetes": {
        "warning_drugs": ["prednisone", "prednisolone", "dexamethasone"],
        "message": "This medicine may affect blood sugar levels. Monitor glucose closely."
    },
    "hypertension": {
        "warning_drugs": ["ibuprofen", "naproxen", "aspirin", "pseudoephedrine", "phenylephrine"],
        "message": "This medicine may increase blood pressure. Use with caution."
    },
    "kidney disease": {
        "warning_drugs": ["ibuprofen", "naproxen", "aspirin", "metformin", "lisinopril"],
        "message": "This medicine requires kidney function monitoring."
    },
    "heart disease": {
        "warning_drugs": ["ibuprofen", "naproxen", "pseudoephedrine"],
        "message": "This medicine may affect heart function. Consult your doctor."
    },
}


def analyze_risks(medicines: list, patient_profile: dict) -> dict:
    """
    Analyze prescribed medicines against patient's known allergies and conditions.
    
    Args:
        medicines: List of medicine dicts with 'name' key
        patient_profile: Dict with 'allergies' and 'conditions' lists
        
    Returns:
        Dict with 'alerts' list containing risk warnings
    """
    alerts = []
    allergies = [a.lower() for a in patient_profile.get("allergies", [])]
    conditions = [c.lower() for c in patient_profile.get("conditions", [])]
    
    for med in medicines:
        med_name = med.get("name", "").lower()
        
        # Check allergies
        for allergy in allergies:
            if allergy in ALLERGY_DRUG_MAP:
                related_drugs = ALLERGY_DRUG_MAP[allergy]
                for drug in related_drugs:
                    if drug in med_name:
                        alerts.append({
                            "type": "allergy",
                            "severity": "high",
                            "medicine": med.get("name"),
                            "message": f"⚠️ ALLERGY ALERT: '{med.get('name')}' may trigger your known '{allergy.title()}' allergy!",
                        })
                        break
        
        # Check condition-specific warnings
        for condition in conditions:
            if condition in CONDITION_DRUG_WARNINGS:
                warning_info = CONDITION_DRUG_WARNINGS[condition]
                for drug in warning_info["warning_drugs"]:
                    if drug in med_name:
                        alerts.append({
                            "type": "condition_interaction",
                            "severity": "medium",
                            "medicine": med.get("name"),
                            "condition": condition.title(),
                            "message": f"⚡ CAUTION: '{med.get('name')}' - {warning_info['message']}",
                        })
                        break
        
        # Check blood sugar effects for diabetics/hypoglycemia patients
        if "diabetes" in conditions or "hypoglycemia" in conditions:
            for effect_type, drugs in BLOOD_SUGAR_AFFECTING_DRUGS.items():
                for drug in drugs:
                    if drug in med_name:
                        if effect_type == "increase_sugar":
                            alerts.append({
                                "type": "blood_sugar",
                                "severity": "medium",
                                "medicine": med.get("name"),
                                "message": f"📊 '{med.get('name')}' may INCREASE blood sugar levels.",
                            })
                        else:
                            alerts.append({
                                "type": "blood_sugar",
                                "severity": "low",
                                "medicine": med.get("name"),
                                "message": f"📊 '{med.get('name')}' may DECREASE blood sugar levels.",
                            })
                        break
    
    return {
        "alerts": alerts,
        "risk_score": len([a for a in alerts if a["severity"] == "high"]) * 10 + 
                      len([a for a in alerts if a["severity"] == "medium"]) * 5 +
                      len([a for a in alerts if a["severity"] == "low"]) * 2
    }


def generate_schedule(medicines: list) -> list:
    """
    Generate a medicine intake schedule from parsed prescription.
    
    Args:
        medicines: List of medicine dicts
        
    Returns:
        List of schedule entries
    """
    schedule = []
    
    # Simple schedule generation based on common abbreviations
    time_mappings = {
        "od": ["Morning"],
        "bd": ["Morning", "Night"],
        "tds": ["Morning", "Afternoon", "Night"],
        "qid": ["Morning", "Noon", "Evening", "Night"],
        "sos": ["As needed"],
        "hs": ["Bedtime"],
        "ac": ["Before meals"],
        "pc": ["After meals"],
    }
    
    for med in medicines:
        med_name = med.get("name", "")
        med_lower = med_name.lower()
        
        # Try to detect timing from medicine name/instruction
        times = ["As prescribed"]
        for abbr, time_list in time_mappings.items():
            if abbr in med_lower:
                times = time_list
                break
        
        schedule.append({
            "medicine": med_name,
            "dosage": med.get("dosage", "As directed"),
            "times": times,
            "duration": "As prescribed",
        })
    
    return schedule
