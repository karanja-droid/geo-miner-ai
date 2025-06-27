"""
Geochemical Analysis Service

Advanced geochemical analysis tools including element analysis, mineralogy,
and geochemical modeling capabilities.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional, Tuple
import logging
from scipy import stats
from scipy.spatial.distance import cdist
import plotly.graph_objects as go
import plotly.express as px
from sklearn.cluster import KMeans, DBSCAN
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest
import periodictable as pt
from pymatgen.core import Composition
from pymatgen.analysis.phase_diagram import PhaseDiagram, PDPlotter

logger = logging.getLogger(__name__)


class GeochemicalAnalysisService:
    """Service for advanced geochemical analysis."""
    
    def __init__(self):
        """Initialize geochemical analysis service."""
        self.element_data = self._load_element_data()
        self.mineral_database = self._load_mineral_database()
    
    def analyze_element_concentrations(
        self,
        data: pd.DataFrame,
        element_columns: List[str],
        sample_id_col: str = "sample_id",
        depth_col: Optional[str] = None
    ) -> Dict[str, Any]:
        """Analyze element concentrations in geochemical samples."""
        try:
            # Basic statistics for each element
            element_stats = {}
            for element in element_columns:
                if element in data.columns:
                    element_data = data[element].dropna()
                    element_stats[element] = {
                        "count": len(element_data),
                        "mean": element_data.mean(),
                        "std": element_data.std(),
                        "min": element_data.min(),
                        "max": element_data.max(),
                        "median": element_data.median(),
                        "skewness": stats.skew(element_data),
                        "kurtosis": stats.kurtosis(element_data),
                        "detection_limit": element_data[element_data > 0].min() if len(element_data[element_data > 0]) > 0 else 0
                    }
            
            # Correlation analysis
            correlation_matrix = data[element_columns].corr().to_dict()
            
            # Principal Component Analysis
            pca_results = self._perform_pca(data[element_columns])
            
            # Anomaly detection
            anomalies = self._detect_geochemical_anomalies(data[element_columns])
            
            # Depth analysis if available
            depth_analysis = None
            if depth_col and depth_col in data.columns:
                depth_analysis = self._analyze_depth_variations(data, element_columns, depth_col)
            
            return {
                "element_statistics": element_stats,
                "correlation_matrix": correlation_matrix,
                "pca_analysis": pca_results,
                "anomaly_detection": anomalies,
                "depth_analysis": depth_analysis,
                "interpretation": self._interpret_element_data(element_stats, correlation_matrix, anomalies)
            }
        
        except Exception as e:
            logger.error(f"Error in element concentration analysis: {e}")
            return {"error": str(e)}
    
    def analyze_mineralogy(
        self,
        data: pd.DataFrame,
        mineral_columns: List[str],
        sample_id_col: str = "sample_id"
    ) -> Dict[str, Any]:
        """Analyze mineralogical data."""
        try:
            # Mineral abundance analysis
            mineral_stats = {}
            for mineral in mineral_columns:
                if mineral in data.columns:
                    mineral_data = data[mineral].dropna()
                    mineral_stats[mineral] = {
                        "count": len(mineral_data),
                        "mean_abundance": mineral_data.mean(),
                        "max_abundance": mineral_data.max(),
                        "presence_frequency": (mineral_data > 0).mean(),
                        "dominant_samples": len(mineral_data[mineral_data > mineral_data.mean() + mineral_data.std()])
                    }
            
            # Mineral associations
            associations = self._analyze_mineral_associations(data[mineral_columns])
            
            # Mineral assemblages
            assemblages = self._identify_mineral_assemblages(data[mineral_columns])
            
            # Alteration analysis
            alteration = self._analyze_alteration_patterns(data[mineral_columns])
            
            return {
                "mineral_statistics": mineral_stats,
                "mineral_associations": associations,
                "mineral_assemblages": assemblages,
                "alteration_analysis": alteration,
                "interpretation": self._interpret_mineralogy(mineral_stats, associations, alteration)
            }
        
        except Exception as e:
            logger.error(f"Error in mineralogy analysis: {e}")
            return {"error": str(e)}
    
    def perform_geochemical_modeling(
        self,
        data: pd.DataFrame,
        major_elements: List[str],
        trace_elements: List[str],
        temperature: float = 25.0,
        pressure: float = 1.0
    ) -> Dict[str, Any]:
        """Perform geochemical modeling and speciation calculations."""
        try:
            # Major element modeling
            major_element_modeling = self._model_major_elements(data[major_elements], temperature, pressure)
            
            # Trace element modeling
            trace_element_modeling = self._model_trace_elements(data[trace_elements], temperature, pressure)
            
            # Phase diagram analysis
            phase_diagrams = self._create_phase_diagrams(data[major_elements])
            
            # Geochemical indices
            indices = self._calculate_geochemical_indices(data, major_elements, trace_elements)
            
            # Saturation indices
            saturation = self._calculate_saturation_indices(data, major_elements, temperature, pressure)
            
            return {
                "major_element_modeling": major_element_modeling,
                "trace_element_modeling": trace_element_modeling,
                "phase_diagrams": phase_diagrams,
                "geochemical_indices": indices,
                "saturation_indices": saturation,
                "interpretation": self._interpret_geochemical_modeling(indices, saturation)
            }
        
        except Exception as e:
            logger.error(f"Error in geochemical modeling: {e}")
            return {"error": str(e)}
    
    def analyze_isotope_data(
        self,
        data: pd.DataFrame,
        isotope_columns: List[str],
        sample_id_col: str = "sample_id"
    ) -> Dict[str, Any]:
        """Analyze isotopic data."""
        try:
            # Isotope statistics
            isotope_stats = {}
            for isotope in isotope_columns:
                if isotope in data.columns:
                    isotope_data = data[isotope].dropna()
                    isotope_stats[isotope] = {
                        "count": len(isotope_data),
                        "mean": isotope_data.mean(),
                        "std": isotope_data.std(),
                        "min": isotope_data.min(),
                        "max": isotope_data.max(),
                        "range": isotope_data.max() - isotope_data.min()
                    }
            
            # Isotope correlations
            isotope_correlations = data[isotope_columns].corr().to_dict()
            
            # Isotope fractionation analysis
            fractionation = self._analyze_isotope_fractionation(data[isotope_columns])
            
            # Source identification
            sources = self._identify_isotope_sources(data[isotope_columns])
            
            return {
                "isotope_statistics": isotope_stats,
                "isotope_correlations": isotope_correlations,
                "fractionation_analysis": fractionation,
                "source_identification": sources,
                "interpretation": self._interpret_isotope_data(isotope_stats, fractionation, sources)
            }
        
        except Exception as e:
            logger.error(f"Error in isotope analysis: {e}")
            return {"error": str(e)}
    
    def create_geochemical_plots(
        self,
        data: pd.DataFrame,
        element_columns: List[str],
        plot_types: List[str] = ["scatter", "histogram", "box", "correlation"]
    ) -> Dict[str, Any]:
        """Create various geochemical plots."""
        try:
            plots = {}
            
            if "scatter" in plot_types:
                plots["scatter_plots"] = self._create_scatter_plots(data, element_columns)
            
            if "histogram" in plot_types:
                plots["histograms"] = self._create_histograms(data, element_columns)
            
            if "box" in plot_types:
                plots["box_plots"] = self._create_box_plots(data, element_columns)
            
            if "correlation" in plot_types:
                plots["correlation_heatmap"] = self._create_correlation_heatmap(data, element_columns)
            
            if "ternary" in plot_types:
                plots["ternary_diagrams"] = self._create_ternary_diagrams(data, element_columns)
            
            return plots
        
        except Exception as e:
            logger.error(f"Error creating geochemical plots: {e}")
            return {"error": str(e)}
    
    def _load_element_data(self) -> Dict[str, Any]:
        """Load element data from periodic table."""
        elements = {}
        for element in pt.elements:
            if element.number > 0:  # Skip placeholder elements
                elements[element.symbol] = {
                    "name": element.name,
                    "atomic_number": element.number,
                    "atomic_weight": element.mass,
                    "density": getattr(element, 'density', None),
                    "melting_point": getattr(element, 'melting_point', None),
                    "boiling_point": getattr(element, 'boiling_point', None)
                }
        return elements
    
    def _load_mineral_database(self) -> Dict[str, Any]:
        """Load mineral database."""
        # Simplified mineral database - in practice, this would be more comprehensive
        return {
            "quartz": {"formula": "SiO2", "density": 2.65, "hardness": 7},
            "feldspar": {"formula": "KAlSi3O8", "density": 2.56, "hardness": 6},
            "calcite": {"formula": "CaCO3", "density": 2.71, "hardness": 3},
            "pyrite": {"formula": "FeS2", "density": 5.02, "hardness": 6.5},
            "chalcopyrite": {"formula": "CuFeS2", "density": 4.2, "hardness": 3.5},
            "galena": {"formula": "PbS", "density": 7.6, "hardness": 2.5},
            "sphalerite": {"formula": "ZnS", "density": 4.1, "hardness": 3.5}
        }
    
    def _perform_pca(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Perform Principal Component Analysis."""
        # Remove rows with missing values
        data_clean = data.dropna()
        
        if len(data_clean) < 2:
            return {"error": "Insufficient data for PCA"}
        
        # Standardize data
        scaler = StandardScaler()
        data_scaled = scaler.fit_transform(data_clean)
        
        # Perform PCA
        pca = PCA()
        pca_result = pca.fit_transform(data_scaled)
        
        return {
            "explained_variance_ratio": pca.explained_variance_ratio_.tolist(),
            "cumulative_variance_ratio": np.cumsum(pca.explained_variance_ratio_).tolist(),
            "components": pca.components_.tolist(),
            "feature_names": data.columns.tolist(),
            "n_components": len(pca.explained_variance_ratio_)
        }
    
    def _detect_geochemical_anomalies(
        self,
        data: pd.DataFrame,
        method: str = "isolation_forest"
    ) -> Dict[str, Any]:
        """Detect geochemical anomalies."""
        anomalies = {}
        
        if method == "isolation_forest":
            # Use Isolation Forest for anomaly detection
            iso_forest = IsolationForest(contamination=0.1, random_state=42)
            anomaly_labels = iso_forest.fit_predict(data.fillna(data.mean()))
            
            for column in data.columns:
                column_data = data[column].dropna()
                anomaly_indices = np.where(anomaly_labels == -1)[0]
                anomalies[column] = {
                    "anomaly_count": len(anomaly_indices),
                    "anomaly_percentage": len(anomaly_indices) / len(column_data) * 100,
                    "anomaly_values": column_data.iloc[anomaly_indices].tolist() if len(anomaly_indices) > 0 else []
                }
        
        elif method == "statistical":
            # Use statistical methods (mean + 2*std)
            for column in data.columns:
                column_data = data[column].dropna()
                mean_val = column_data.mean()
                std_val = column_data.std()
                threshold = mean_val + 2 * std_val
                
                anomaly_mask = column_data > threshold
                anomaly_indices = np.where(anomaly_mask)[0]
                
                anomalies[column] = {
                    "anomaly_count": len(anomaly_indices),
                    "anomaly_percentage": len(anomaly_indices) / len(column_data) * 100,
                    "threshold": threshold,
                    "anomaly_values": column_data.iloc[anomaly_indices].tolist() if len(anomaly_indices) > 0 else []
                }
        
        return anomalies
    
    def _analyze_depth_variations(
        self,
        data: pd.DataFrame,
        element_columns: List[str],
        depth_col: str
    ) -> Dict[str, Any]:
        """Analyze depth variations in geochemical data."""
        depth_analysis = {}
        
        for element in element_columns:
            if element in data.columns:
                # Remove missing values
                valid_data = data[[depth_col, element]].dropna()
                
                if len(valid_data) > 1:
                    # Calculate correlation with depth
                    correlation = valid_data[element].corr(valid_data[depth_col])
                    
                    # Calculate trend (linear regression)
                    slope, intercept, r_value, p_value, std_err = stats.linregress(
                        valid_data[depth_col], valid_data[element]
                    )
                    
                    depth_analysis[element] = {
                        "depth_correlation": correlation,
                        "trend_slope": slope,
                        "trend_intercept": intercept,
                        "r_squared": r_value**2,
                        "p_value": p_value,
                        "trend_significance": "significant" if p_value < 0.05 else "not_significant"
                    }
        
        return depth_analysis
    
    def _analyze_mineral_associations(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Analyze mineral associations using correlation."""
        # Calculate correlation matrix
        correlation_matrix = data.corr()
        
        # Find strong associations (correlation > 0.7)
        strong_associations = []
        for i in range(len(correlation_matrix.columns)):
            for j in range(i+1, len(correlation_matrix.columns)):
                corr_value = correlation_matrix.iloc[i, j]
                if abs(corr_value) > 0.7:
                    strong_associations.append({
                        "mineral1": correlation_matrix.columns[i],
                        "mineral2": correlation_matrix.columns[j],
                        "correlation": corr_value,
                        "association_type": "positive" if corr_value > 0 else "negative"
                    })
        
        return {
            "correlation_matrix": correlation_matrix.to_dict(),
            "strong_associations": strong_associations
        }
    
    def _identify_mineral_assemblages(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Identify mineral assemblages using clustering."""
        # Use K-means clustering to identify assemblages
        kmeans = KMeans(n_clusters=min(5, len(data)), random_state=42)
        clusters = kmeans.fit_predict(data.fillna(0))
        
        assemblages = {}
        for i in range(kmeans.n_clusters):
            cluster_data = data[clusters == i]
            assemblages[f"assemblage_{i+1}"] = {
                "sample_count": len(cluster_data),
                "dominant_minerals": self._find_dominant_minerals(cluster_data),
                "average_composition": cluster_data.mean().to_dict()
            }
        
        return assemblages
    
    def _find_dominant_minerals(self, data: pd.DataFrame) -> List[str]:
        """Find dominant minerals in a dataset."""
        mean_composition = data.mean()
        # Return minerals with abundance > 50% of maximum
        threshold = mean_composition.max() * 0.5
        dominant = mean_composition[mean_composition > threshold]
        return dominant.index.tolist()
    
    def _analyze_alteration_patterns(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Analyze alteration patterns in mineralogical data."""
        # Calculate alteration indices
        alteration_indices = {}
        
        # Simplified alteration analysis
        for mineral in data.columns:
            mineral_data = data[mineral].dropna()
            if len(mineral_data) > 0:
                # Calculate alteration intensity (simplified)
                alteration_intensity = (mineral_data > mineral_data.mean() + mineral_data.std()).mean()
                alteration_indices[mineral] = {
                    "alteration_intensity": alteration_intensity,
                    "alteration_category": "high" if alteration_intensity > 0.3 else "moderate" if alteration_intensity > 0.1 else "low"
                }
        
        return alteration_indices
    
    def _model_major_elements(
        self,
        data: pd.DataFrame,
        temperature: float,
        pressure: float
    ) -> Dict[str, Any]:
        """Model major element geochemistry."""
        # Simplified major element modeling
        modeling_results = {}
        
        for element in data.columns:
            element_data = data[element].dropna()
            if len(element_data) > 0:
                # Calculate speciation (simplified)
                speciation = self._calculate_element_speciation(element, element_data.mean(), temperature, pressure)
                modeling_results[element] = {
                    "average_concentration": element_data.mean(),
                    "speciation": speciation,
                    "temperature_dependence": self._calculate_temperature_dependence(element, temperature)
                }
        
        return modeling_results
    
    def _model_trace_elements(
        self,
        data: pd.DataFrame,
        temperature: float,
        pressure: float
    ) -> Dict[str, Any]:
        """Model trace element geochemistry."""
        # Simplified trace element modeling
        modeling_results = {}
        
        for element in data.columns:
            element_data = data[element].dropna()
            if len(element_data) > 0:
                # Calculate partition coefficients (simplified)
                partition_coefficient = self._calculate_partition_coefficient(element, temperature)
                modeling_results[element] = {
                    "average_concentration": element_data.mean(),
                    "partition_coefficient": partition_coefficient,
                    "enrichment_factor": self._calculate_enrichment_factor(element_data)
                }
        
        return modeling_results
    
    def _create_phase_diagrams(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Create phase diagrams for major elements."""
        # Simplified phase diagram creation
        phase_diagrams = {}
        
        # Create ACF diagram (Al2O3-CaO-FeO)
        if all(element in data.columns for element in ["Al2O3", "CaO", "FeO"]):
            acf_data = data[["Al2O3", "CaO", "FeO"]].dropna()
            if len(acf_data) > 0:
                phase_diagrams["ACF"] = {
                    "data": acf_data.to_dict(),
                    "interpretation": "ACF diagram showing metamorphic facies"
                }
        
        # Create AFM diagram (Al2O3-FeO-MgO)
        if all(element in data.columns for element in ["Al2O3", "FeO", "MgO"]):
            afm_data = data[["Al2O3", "FeO", "MgO"]].dropna()
            if len(afm_data) > 0:
                phase_diagrams["AFM"] = {
                    "data": afm_data.to_dict(),
                    "interpretation": "AFM diagram showing metamorphic conditions"
                }
        
        return phase_diagrams
    
    def _calculate_geochemical_indices(
        self,
        data: pd.DataFrame,
        major_elements: List[str],
        trace_elements: List[str]
    ) -> Dict[str, Any]:
        """Calculate various geochemical indices."""
        indices = {}
        
        # Weathering indices
        if all(element in data.columns for element in ["Al2O3", "CaO", "Na2O", "K2O"]):
            # CIA (Chemical Index of Alteration)
            cia = data["Al2O3"] / (data["Al2O3"] + data["CaO"] + data["Na2O"] + data["K2O"]) * 100
            indices["CIA"] = {
                "values": cia.dropna().tolist(),
                "mean": cia.mean(),
                "interpretation": self._interpret_cia(cia.mean())
            }
        
        # Fertility indices
        if "Cu" in data.columns and "Au" in data.columns:
            # Cu/Au ratio
            cu_au_ratio = data["Cu"] / data["Au"]
            indices["Cu_Au_Ratio"] = {
                "values": cu_au_ratio.dropna().tolist(),
                "mean": cu_au_ratio.mean(),
                "interpretation": self._interpret_cu_au_ratio(cu_au_ratio.mean())
            }
        
        return indices
    
    def _calculate_saturation_indices(
        self,
        data: pd.DataFrame,
        major_elements: List[str],
        temperature: float,
        pressure: float
    ) -> Dict[str, Any]:
        """Calculate mineral saturation indices."""
        # Simplified saturation index calculation
        saturation_indices = {}
        
        # Calculate saturation indices for common minerals
        minerals = ["calcite", "dolomite", "gypsum", "anhydrite"]
        
        for mineral in minerals:
            if mineral == "calcite" and "Ca" in data.columns and "CO3" in data.columns:
                # Simplified calcite saturation index
                si_calcite = np.log10(data["Ca"] * data["CO3"] / 1e-8)  # Simplified
                saturation_indices[mineral] = {
                    "values": si_calcite.dropna().tolist(),
                    "mean": si_calcite.mean(),
                    "saturation_state": "supersaturated" if si_calcite.mean() > 0 else "undersaturated"
                }
        
        return saturation_indices
    
    def _calculate_element_speciation(
        self,
        element: str,
        concentration: float,
        temperature: float,
        pressure: float
    ) -> Dict[str, float]:
        """Calculate element speciation (simplified)."""
        # Simplified speciation calculation
        speciation = {}
        
        if element in ["Fe", "Cu", "Zn"]:
            # Simplified redox speciation
            speciation["reduced"] = concentration * 0.3
            speciation["oxidized"] = concentration * 0.7
        else:
            speciation["total"] = concentration
        
        return speciation
    
    def _calculate_temperature_dependence(self, element: str, temperature: float) -> float:
        """Calculate temperature dependence of element behavior."""
        # Simplified temperature dependence
        base_temp = 25.0
        temp_factor = (temperature - base_temp) / 100.0
        
        if element in ["Fe", "Cu"]:
            return 1.0 + temp_factor * 0.1
        else:
            return 1.0 + temp_factor * 0.05
    
    def _calculate_partition_coefficient(self, element: str, temperature: float) -> float:
        """Calculate partition coefficient for trace elements."""
        # Simplified partition coefficients
        base_coefficients = {
            "Cu": 0.1,
            "Au": 0.01,
            "Ag": 0.05,
            "Pb": 0.2,
            "Zn": 0.3
        }
        
        base_coeff = base_coefficients.get(element, 0.1)
        temp_factor = temperature / 1000.0  # Normalized temperature
        
        return base_coeff * (1.0 + temp_factor * 0.5)
    
    def _calculate_enrichment_factor(self, data: pd.Series) -> float:
        """Calculate enrichment factor for trace elements."""
        # Simplified enrichment factor calculation
        mean_concentration = data.mean()
        background = data.quantile(0.25)  # Use 25th percentile as background
        
        if background > 0:
            return mean_concentration / background
        else:
            return 1.0
    
    def _create_scatter_plots(self, data: pd.DataFrame, element_columns: List[str]) -> Dict[str, Any]:
        """Create scatter plots for element pairs."""
        plots = {}
        
        for i, element1 in enumerate(element_columns):
            for element2 in element_columns[i+1:]:
                if element1 in data.columns and element2 in data.columns:
                    plot_data = data[[element1, element2]].dropna()
                    
                    if len(plot_data) > 0:
                        fig = px.scatter(
                            plot_data,
                            x=element1,
                            y=element2,
                            title=f"{element1} vs {element2}",
                            labels={element1: f"{element1} (ppm)", element2: f"{element2} (ppm)"}
                        )
                        
                        plots[f"{element1}_vs_{element2}"] = fig.to_dict()
        
        return plots
    
    def _create_histograms(self, data: pd.DataFrame, element_columns: List[str]) -> Dict[str, Any]:
        """Create histograms for elements."""
        plots = {}
        
        for element in element_columns:
            if element in data.columns:
                element_data = data[element].dropna()
                
                if len(element_data) > 0:
                    fig = px.histogram(
                        element_data,
                        title=f"Distribution of {element}",
                        labels={"value": f"{element} (ppm)", "count": "Frequency"}
                    )
                    
                    plots[element] = fig.to_dict()
        
        return plots
    
    def _create_box_plots(self, data: pd.DataFrame, element_columns: List[str]) -> Dict[str, Any]:
        """Create box plots for elements."""
        plots = {}
        
        for element in element_columns:
            if element in data.columns:
                element_data = data[element].dropna()
                
                if len(element_data) > 0:
                    fig = px.box(
                        y=element_data,
                        title=f"Box Plot of {element}",
                        labels={"y": f"{element} (ppm)"}
                    )
                    
                    plots[element] = fig.to_dict()
        
        return plots
    
    def _create_correlation_heatmap(self, data: pd.DataFrame, element_columns: List[str]) -> Dict[str, Any]:
        """Create correlation heatmap."""
        correlation_matrix = data[element_columns].corr()
        
        fig = px.imshow(
            correlation_matrix,
            title="Element Correlation Matrix",
            color_continuous_scale="RdBu",
            aspect="auto"
        )
        
        return {"correlation_heatmap": fig.to_dict()}
    
    def _create_ternary_diagrams(self, data: pd.DataFrame, element_columns: List[str]) -> Dict[str, Any]:
        """Create ternary diagrams for three elements."""
        plots = {}
        
        # Create ternary diagrams for common element combinations
        ternary_combinations = [
            ["SiO2", "Al2O3", "Fe2O3"],
            ["CaO", "MgO", "FeO"],
            ["Na2O", "K2O", "CaO"]
        ]
        
        for combo in ternary_combinations:
            if all(element in data.columns for element in combo):
                plot_data = data[combo].dropna()
                
                if len(plot_data) > 0:
                    fig = px.scatter_ternary(
                        plot_data,
                        a=combo[0],
                        b=combo[1],
                        c=combo[2],
                        title=f"Ternary Diagram: {combo[0]}-{combo[1]}-{combo[2]}"
                    )
                    
                    plots[f"ternary_{combo[0]}_{combo[1]}_{combo[2]}"] = fig.to_dict()
        
        return plots
    
    def _analyze_isotope_fractionation(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Analyze isotope fractionation patterns."""
        # Simplified isotope fractionation analysis
        fractionation_analysis = {}
        
        for isotope in data.columns:
            isotope_data = data[isotope].dropna()
            if len(isotope_data) > 1:
                fractionation_analysis[isotope] = {
                    "range": isotope_data.max() - isotope_data.min(),
                    "mean": isotope_data.mean(),
                    "std": isotope_data.std(),
                    "fractionation_type": self._determine_fractionation_type(isotope, isotope_data)
                }
        
        return fractionation_analysis
    
    def _determine_fractionation_type(self, isotope: str, data: pd.Series) -> str:
        """Determine type of isotope fractionation."""
        # Simplified fractionation type determination
        range_val = data.max() - data.min()
        mean_val = data.mean()
        
        if range_val > mean_val * 0.1:
            return "significant"
        elif range_val > mean_val * 0.05:
            return "moderate"
        else:
            return "minimal"
    
    def _identify_isotope_sources(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Identify potential isotope sources."""
        # Simplified source identification
        sources = {}
        
        for isotope in data.columns:
            isotope_data = data[isotope].dropna()
            if len(isotope_data) > 0:
                mean_val = isotope_data.mean()
                sources[isotope] = {
                    "mean_value": mean_val,
                    "potential_sources": self._get_potential_sources(isotope, mean_val)
                }
        
        return sources
    
    def _get_potential_sources(self, isotope: str, value: float) -> List[str]:
        """Get potential sources for isotope values."""
        # Simplified source identification
        sources = {
            "δ18O": ["mantle", "crustal", "hydrothermal", "meteoric"],
            "δ13C": ["organic", "inorganic", "mantle", "hydrothermal"],
            "87Sr/86Sr": ["mantle", "crustal", "seawater", "hydrothermal"],
            "206Pb/204Pb": ["mantle", "crustal", "ore-forming"]
        }
        
        return sources.get(isotope, ["unknown"])
    
    def _interpret_element_data(
        self,
        stats: Dict[str, Any],
        correlations: Dict[str, Any],
        anomalies: Dict[str, Any]
    ) -> str:
        """Interpret element concentration data."""
        interpretation = []
        
        # Interpret element distributions
        for element, element_stats in stats.items():
            if element_stats["skewness"] > 1:
                interpretation.append(f"{element} shows highly skewed distribution suggesting mineralization or enrichment")
            elif element_stats["skewness"] < -1:
                interpretation.append(f"{element} shows negative skew suggesting depletion or weathering")
        
        # Interpret anomalies
        total_anomalies = sum(anomaly["anomaly_count"] for anomaly in anomalies.values())
        if total_anomalies > 0:
            interpretation.append(f"Detected {total_anomalies} geochemical anomalies across all elements")
        
        return " ".join(interpretation)
    
    def _interpret_mineralogy(
        self,
        stats: Dict[str, Any],
        associations: Dict[str, Any],
        alteration: Dict[str, Any]
    ) -> str:
        """Interpret mineralogical data."""
        interpretation = []
        
        # Interpret mineral associations
        strong_assocs = associations.get("strong_associations", [])
        if strong_assocs:
            interpretation.append(f"Found {len(strong_assocs)} strong mineral associations")
        
        # Interpret alteration
        high_alteration = [mineral for mineral, alt_data in alteration.items() 
                          if alt_data["alteration_category"] == "high"]
        if high_alteration:
            interpretation.append(f"High alteration intensity detected in {len(high_alteration)} minerals")
        
        return " ".join(interpretation)
    
    def _interpret_geochemical_modeling(
        self,
        indices: Dict[str, Any],
        saturation: Dict[str, Any]
    ) -> str:
        """Interpret geochemical modeling results."""
        interpretation = []
        
        # Interpret weathering indices
        if "CIA" in indices:
            cia_interpretation = indices["CIA"]["interpretation"]
            interpretation.append(f"Weathering analysis: {cia_interpretation}")
        
        # Interpret saturation states
        supersaturated = [mineral for mineral, sat_data in saturation.items() 
                         if sat_data["saturation_state"] == "supersaturated"]
        if supersaturated:
            interpretation.append(f"Supersaturated minerals: {', '.join(supersaturated)}")
        
        return " ".join(interpretation)
    
    def _interpret_isotope_data(
        self,
        stats: Dict[str, Any],
        fractionation: Dict[str, Any],
        sources: Dict[str, Any]
    ) -> str:
        """Interpret isotopic data."""
        interpretation = []
        
        # Interpret fractionation
        significant_fractionation = [isotope for isotope, frac_data in fractionation.items() 
                                   if frac_data["fractionation_type"] == "significant"]
        if significant_fractionation:
            interpretation.append(f"Significant fractionation detected in {len(significant_fractionation)} isotopes")
        
        # Interpret sources
        for isotope, source_data in sources.items():
            if len(source_data["potential_sources"]) > 1:
                interpretation.append(f"{isotope} shows mixed source characteristics")
        
        return " ".join(interpretation)
    
    def _interpret_cia(self, cia_value: float) -> str:
        """Interpret CIA values."""
        if cia_value < 50:
            return "Low weathering, fresh rock"
        elif cia_value < 60:
            return "Low to moderate weathering"
        elif cia_value < 80:
            return "Moderate to high weathering"
        else:
            return "High weathering, intense alteration"
    
    def _interpret_cu_au_ratio(self, ratio: float) -> str:
        """Interpret Cu/Au ratios."""
        if ratio > 10000:
            return "High Cu/Au ratio, porphyry-style mineralization likely"
        elif ratio > 1000:
            return "Moderate Cu/Au ratio, mixed mineralization styles"
        else:
            return "Low Cu/Au ratio, epithermal or orogenic gold style"


# Global geochemical analysis service instance
geochemical_analysis_service = GeochemicalAnalysisService() 