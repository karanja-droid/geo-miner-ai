"""
Geological Analysis Service

Advanced geological analysis tools including geostatistics, structural analysis,
and 3D modeling capabilities.
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
import gstools as gs
from pykrige.ok import OrdinaryKriging
from pykrige.uk import UniversalKriging

logger = logging.getLogger(__name__)


class GeologicalAnalysisService:
    """Service for advanced geological analysis."""
    
    def __init__(self):
        """Initialize geological analysis service."""
        self.variogram_models = {
            "spherical": gs.Spherical,
            "exponential": gs.Exponential,
            "gaussian": gs.Gaussian,
            "matern": gs.Matern,
            "stable": gs.Stable
        }
    
    def analyze_structural_geology(
        self,
        data: pd.DataFrame,
        x_col: str = "x",
        y_col: str = "y",
        z_col: str = "z",
        strike_col: str = "strike",
        dip_col: str = "dip"
    ) -> Dict[str, Any]:
        """Analyze structural geology data."""
        try:
            # Basic statistics
            stats_summary = {
                "strike_stats": {
                    "mean": data[strike_col].mean(),
                    "std": data[strike_col].std(),
                    "min": data[strike_col].min(),
                    "max": data[strike_col].max()
                },
                "dip_stats": {
                    "mean": data[dip_col].mean(),
                    "std": data[dip_col].std(),
                    "min": data[dip_col].min(),
                    "max": data[dip_col].max()
                }
            }
            
            # Rose diagram analysis
            strike_rose = self._create_rose_diagram(data[strike_col], "strike")
            dip_rose = self._create_rose_diagram(data[dip_col], "dip")
            
            # Structural domains clustering
            structural_domains = self._identify_structural_domains(
                data[[strike_col, dip_col]]
            )
            
            # Fault analysis
            fault_analysis = self._analyze_fault_patterns(data)
            
            return {
                "structural_statistics": stats_summary,
                "strike_rose_diagram": strike_rose,
                "dip_rose_diagram": dip_rose,
                "structural_domains": structural_domains,
                "fault_analysis": fault_analysis,
                "interpretation": self._interpret_structural_data(stats_summary, structural_domains)
            }
        
        except Exception as e:
            logger.error(f"Error in structural geology analysis: {e}")
            return {"error": str(e)}
    
    def perform_geostatistical_analysis(
        self,
        data: pd.DataFrame,
        x_col: str = "x",
        y_col: str = "y",
        z_col: str = "z",
        value_col: str = "value",
        variogram_model: str = "spherical"
    ) -> Dict[str, Any]:
        """Perform geostatistical analysis including variography and kriging."""
        try:
            # Prepare data
            coords = data[[x_col, y_col, z_col]].values
            values = data[value_col].values
            
            # Basic statistics
            basic_stats = {
                "count": len(values),
                "mean": np.mean(values),
                "std": np.std(values),
                "min": np.min(values),
                "max": np.max(values),
                "skewness": stats.skew(values),
                "kurtosis": stats.kurtosis(values)
            }
            
            # Variogram analysis
            variogram = self._calculate_variogram(coords, values, variogram_model)
            
            # Kriging interpolation
            kriging_result = self._perform_kriging(coords, values, variogram)
            
            # Cross-validation
            cv_results = self._cross_validate_kriging(coords, values, variogram)
            
            return {
                "basic_statistics": basic_stats,
                "variogram_analysis": variogram,
                "kriging_result": kriging_result,
                "cross_validation": cv_results,
                "interpretation": self._interpret_geostatistical_results(basic_stats, variogram, cv_results)
            }
        
        except Exception as e:
            logger.error(f"Error in geostatistical analysis: {e}")
            return {"error": str(e)}
    
    def analyze_stratigraphy(
        self,
        data: pd.DataFrame,
        depth_col: str = "depth",
        formation_col: str = "formation",
        lithology_col: str = "lithology"
    ) -> Dict[str, Any]:
        """Analyze stratigraphic data."""
        try:
            # Formation thickness analysis
            formation_thickness = data.groupby(formation_col)[depth_col].agg([
                'min', 'max', 'count'
            ]).assign(thickness=lambda x: x['max'] - x['min'])
            
            # Lithology distribution
            lithology_dist = data[lithology_col].value_counts().to_dict()
            
            # Stratigraphic sequence
            strat_sequence = self._create_stratigraphic_sequence(data, depth_col, formation_col)
            
            # Correlation analysis
            correlation = self._analyze_stratigraphic_correlation(data)
            
            return {
                "formation_thickness": formation_thickness.to_dict(),
                "lithology_distribution": lithology_dist,
                "stratigraphic_sequence": strat_sequence,
                "correlation_analysis": correlation,
                "interpretation": self._interpret_stratigraphic_data(formation_thickness, lithology_dist)
            }
        
        except Exception as e:
            logger.error(f"Error in stratigraphic analysis: {e}")
            return {"error": str(e)}
    
    def create_3d_geological_model(
        self,
        data: pd.DataFrame,
        x_col: str = "x",
        y_col: str = "y",
        z_col: str = "z",
        formation_col: str = "formation"
    ) -> Dict[str, Any]:
        """Create 3D geological model."""
        try:
            # Create 3D scatter plot
            fig_3d = go.Figure(data=[go.Scatter3d(
                x=data[x_col],
                y=data[y_col],
                z=data[z_col],
                mode='markers',
                marker=dict(
                    size=5,
                    color=data[formation_col].astype('category').cat.codes,
                    colorscale='Viridis',
                    opacity=0.8
                ),
                text=data[formation_col],
                hovertemplate='<b>%{text}</b><br>' +
                            f'{x_col}: %{{x}}<br>' +
                            f'{y_col}: %{{y}}<br>' +
                            f'{z_col}: %{{z}}<extra></extra>'
            )])
            
            fig_3d.update_layout(
                title="3D Geological Model",
                scene=dict(
                    xaxis_title=x_col,
                    yaxis_title=y_col,
                    zaxis_title=z_col
                )
            )
            
            # Create formation surfaces
            formation_surfaces = self._create_formation_surfaces(data, x_col, y_col, z_col, formation_col)
            
            return {
                "3d_scatter_plot": fig_3d.to_dict(),
                "formation_surfaces": formation_surfaces,
                "model_statistics": {
                    "total_points": len(data),
                    "formations": data[formation_col].nunique(),
                    "x_range": [data[x_col].min(), data[x_col].max()],
                    "y_range": [data[y_col].min(), data[y_col].max()],
                    "z_range": [data[z_col].min(), data[z_col].max()]
                }
            }
        
        except Exception as e:
            logger.error(f"Error in 3D geological modeling: {e}")
            return {"error": str(e)}
    
    def _create_rose_diagram(self, data: pd.Series, data_type: str) -> Dict[str, Any]:
        """Create rose diagram for structural data."""
        # Convert to radians and create histogram
        angles_rad = np.radians(data)
        
        # Create histogram
        bins = np.linspace(0, 2*np.pi, 18)  # 20-degree bins
        hist, bin_edges = np.histogram(angles_rad, bins=bins)
        
        # Convert back to degrees for plotting
        bin_centers = np.degrees((bin_edges[:-1] + bin_edges[1:]) / 2)
        
        return {
            "bin_centers": bin_centers.tolist(),
            "frequencies": hist.tolist(),
            "data_type": data_type,
            "total_measurements": len(data)
        }
    
    def _identify_structural_domains(
        self,
        data: pd.DataFrame,
        n_clusters: int = 3
    ) -> Dict[str, Any]:
        """Identify structural domains using clustering."""
        # Normalize data
        scaler = StandardScaler()
        data_scaled = scaler.fit_transform(data)
        
        # Perform clustering
        kmeans = KMeans(n_clusters=n_clusters, random_state=42)
        clusters = kmeans.fit_predict(data_scaled)
        
        # Analyze each domain
        domains = {}
        for i in range(n_clusters):
            domain_data = data[clusters == i]
            domains[f"domain_{i+1}"] = {
                "count": len(domain_data),
                "strike_mean": domain_data.iloc[:, 0].mean(),
                "strike_std": domain_data.iloc[:, 0].std(),
                "dip_mean": domain_data.iloc[:, 1].mean(),
                "dip_std": domain_data.iloc[:, 1].std()
            }
        
        return {
            "n_domains": n_clusters,
            "domain_characteristics": domains,
            "cluster_centers": kmeans.cluster_centers_.tolist()
        }
    
    def _analyze_fault_patterns(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Analyze fault patterns and orientations."""
        # Calculate fault density
        fault_density = len(data) / (data['x'].max() - data['x'].min()) / (data['y'].max() - data['y'].min())
        
        # Analyze fault orientations
        strike_trends = self._analyze_orientation_trends(data['strike'])
        dip_trends = self._analyze_orientation_trends(data['dip'])
        
        return {
            "fault_density": fault_density,
            "strike_trends": strike_trends,
            "dip_trends": dip_trends,
            "interpretation": self._interpret_fault_patterns(strike_trends, dip_trends)
        }
    
    def _analyze_orientation_trends(self, data: pd.Series) -> Dict[str, Any]:
        """Analyze orientation trends in structural data."""
        # Calculate circular statistics
        angles_rad = np.radians(data)
        
        # Calculate circular mean
        circular_mean = np.arctan2(
            np.mean(np.sin(angles_rad)),
            np.mean(np.cos(angles_rad))
        )
        
        # Calculate circular variance
        circular_variance = 1 - np.sqrt(
            np.mean(np.cos(angles_rad))**2 + np.mean(np.sin(angles_rad))**2
        )
        
        return {
            "circular_mean_deg": np.degrees(circular_mean),
            "circular_variance": circular_variance,
            "data_range": [data.min(), data.max()],
            "data_std": data.std()
        }
    
    def _calculate_variogram(
        self,
        coords: np.ndarray,
        values: np.ndarray,
        model_type: str
    ) -> Dict[str, Any]:
        """Calculate experimental and theoretical variogram."""
        # Calculate experimental variogram
        bin_edges = np.linspace(0, np.max(cdist(coords, coords)), 20)
        bin_centers = (bin_edges[:-1] + bin_edges[1:]) / 2
        
        # Calculate experimental variogram
        experimental_variogram = []
        for i, h in enumerate(bin_centers):
            # Find pairs within this distance bin
            distances = cdist(coords, coords)
            mask = (distances >= bin_edges[i]) & (distances < bin_edges[i+1])
            
            if np.sum(mask) > 0:
                # Calculate variogram for this bin
                pairs = np.where(mask)
                gamma = 0.5 * np.mean((values[pairs[0]] - values[pairs[1]])**2)
                experimental_variogram.append(gamma)
            else:
                experimental_variogram.append(np.nan)
        
        # Fit theoretical variogram
        valid_indices = ~np.isnan(experimental_variogram)
        if np.sum(valid_indices) > 3:
            # Fit model to experimental variogram
            model = self.variogram_models[model_type](
                dim=3,
                var=np.var(values),
                len_scale=np.mean(bin_centers[valid_indices])
            )
            
            theoretical_variogram = model.variogram(bin_centers)
        else:
            theoretical_variogram = experimental_variogram
        
        return {
            "experimental_variogram": {
                "distances": bin_centers.tolist(),
                "values": experimental_variogram
            },
            "theoretical_variogram": {
                "distances": bin_centers.tolist(),
                "values": theoretical_variogram.tolist() if hasattr(theoretical_variogram, 'tolist') else theoretical_variogram
            },
            "model_type": model_type,
            "model_parameters": {
                "sill": np.var(values),
                "range": np.mean(bin_centers[valid_indices]) if np.sum(valid_indices) > 0 else 0,
                "nugget": 0
            }
        }
    
    def _perform_kriging(
        self,
        coords: np.ndarray,
        values: np.ndarray,
        variogram: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Perform kriging interpolation."""
        try:
            # Create kriging object
            ok = OrdinaryKriging(
                coords[:, 0],
                coords[:, 1],
                values,
                variogram_model='spherical',
                variogram_parameters=[
                    variogram["model_parameters"]["nugget"],
                    variogram["model_parameters"]["sill"],
                    variogram["model_parameters"]["range"]
                ]
            )
            
            # Create grid for interpolation
            x_min, x_max = coords[:, 0].min(), coords[:, 0].max()
            y_min, y_max = coords[:, 1].min(), coords[:, 1].max()
            
            grid_x = np.linspace(x_min, x_max, 50)
            grid_y = np.linspace(y_min, y_max, 50)
            
            # Perform kriging
            kriged_values, kriged_variance = ok.execute('grid', grid_x, grid_y)
            
            return {
                "grid_x": grid_x.tolist(),
                "grid_y": grid_y.tolist(),
                "kriged_values": kriged_values.tolist(),
                "kriged_variance": kriged_variance.tolist(),
                "statistics": {
                    "min_value": np.min(kriged_values),
                    "max_value": np.max(kriged_values),
                    "mean_value": np.mean(kriged_values),
                    "std_value": np.std(kriged_values)
                }
            }
        
        except Exception as e:
            logger.error(f"Error in kriging: {e}")
            return {"error": str(e)}
    
    def _cross_validate_kriging(
        self,
        coords: np.ndarray,
        values: np.ndarray,
        variogram: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Perform cross-validation of kriging."""
        try:
            # Leave-one-out cross-validation
            predicted_values = []
            actual_values = []
            
            for i in range(len(coords)):
                # Remove one point
                coords_cv = np.delete(coords, i, axis=0)
                values_cv = np.delete(values, i)
                
                # Perform kriging
                ok = OrdinaryKriging(
                    coords_cv[:, 0],
                    coords_cv[:, 1],
                    values_cv,
                    variogram_model='spherical',
                    variogram_parameters=[
                        variogram["model_parameters"]["nugget"],
                        variogram["model_parameters"]["sill"],
                        variogram["model_parameters"]["range"]
                    ]
                )
                
                # Predict at removed point
                pred_value, _ = ok.execute('points', coords[i, 0], coords[i, 1])
                predicted_values.append(pred_value[0])
                actual_values.append(values[i])
            
            # Calculate statistics
            predicted_values = np.array(predicted_values)
            actual_values = np.array(actual_values)
            
            mse = np.mean((predicted_values - actual_values)**2)
            rmse = np.sqrt(mse)
            mae = np.mean(np.abs(predicted_values - actual_values))
            r_squared = 1 - np.sum((actual_values - predicted_values)**2) / np.sum((actual_values - np.mean(actual_values))**2)
            
            return {
                "mse": mse,
                "rmse": rmse,
                "mae": mae,
                "r_squared": r_squared,
                "predicted_values": predicted_values.tolist(),
                "actual_values": actual_values.tolist()
            }
        
        except Exception as e:
            logger.error(f"Error in cross-validation: {e}")
            return {"error": str(e)}
    
    def _create_stratigraphic_sequence(
        self,
        data: pd.DataFrame,
        depth_col: str,
        formation_col: str
    ) -> List[Dict[str, Any]]:
        """Create stratigraphic sequence from data."""
        # Sort by depth
        sorted_data = data.sort_values(depth_col)
        
        sequence = []
        current_formation = None
        formation_start = None
        
        for _, row in sorted_data.iterrows():
            if row[formation_col] != current_formation:
                if current_formation is not None:
                    sequence.append({
                        "formation": current_formation,
                        "start_depth": formation_start,
                        "end_depth": row[depth_col],
                        "thickness": row[depth_col] - formation_start
                    })
                
                current_formation = row[formation_col]
                formation_start = row[depth_col]
        
        # Add last formation
        if current_formation is not None:
            sequence.append({
                "formation": current_formation,
                "start_depth": formation_start,
                "end_depth": sorted_data[depth_col].max(),
                "thickness": sorted_data[depth_col].max() - formation_start
            })
        
        return sequence
    
    def _analyze_stratigraphic_correlation(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Analyze stratigraphic correlation between different locations."""
        # This is a simplified correlation analysis
        # In practice, you would implement more sophisticated correlation algorithms
        
        formations = data['formation'].unique()
        correlation_matrix = {}
        
        for formation in formations:
            formation_data = data[data['formation'] == formation]
            correlation_matrix[formation] = {
                "count": len(formation_data),
                "depth_range": [formation_data['depth'].min(), formation_data['depth'].max()],
                "locations": formation_data['x'].nunique()
            }
        
        return correlation_matrix
    
    def _create_formation_surfaces(
        self,
        data: pd.DataFrame,
        x_col: str,
        y_col: str,
        z_col: str,
        formation_col: str
    ) -> Dict[str, Any]:
        """Create formation surfaces for 3D modeling."""
        surfaces = {}
        
        for formation in data[formation_col].unique():
            formation_data = data[data[formation_col] == formation]
            
            # Create surface using triangulation (simplified)
            x = formation_data[x_col].values
            y = formation_data[y_col].values
            z = formation_data[z_col].values
            
            surfaces[formation] = {
                "x": x.tolist(),
                "y": y.tolist(),
                "z": z.tolist(),
                "count": len(formation_data),
                "bounds": {
                    "x_min": x.min(),
                    "x_max": x.max(),
                    "y_min": y.min(),
                    "y_max": y.max(),
                    "z_min": z.min(),
                    "z_max": z.max()
                }
            }
        
        return surfaces
    
    def _interpret_structural_data(
        self,
        stats: Dict[str, Any],
        domains: Dict[str, Any]
    ) -> str:
        """Interpret structural geology data."""
        interpretation = []
        
        # Interpret strike patterns
        strike_mean = stats["strike_stats"]["mean"]
        if 0 <= strike_mean <= 30 or 150 <= strike_mean <= 180:
            interpretation.append("Dominant strike direction suggests N-S to NE-SW trending structures")
        elif 30 <= strike_mean <= 60:
            interpretation.append("Dominant strike direction suggests NE-SW trending structures")
        elif 60 <= strike_mean <= 120:
            interpretation.append("Dominant strike direction suggests E-W trending structures")
        else:
            interpretation.append("Dominant strike direction suggests NW-SE trending structures")
        
        # Interpret dip patterns
        dip_mean = stats["dip_stats"]["mean"]
        if dip_mean < 30:
            interpretation.append("Shallow dipping structures suggest gentle folding or bedding")
        elif 30 <= dip_mean <= 60:
            interpretation.append("Moderate dipping structures suggest moderate deformation")
        else:
            interpretation.append("Steep dipping structures suggest intense deformation or faulting")
        
        # Interpret structural domains
        if domains["n_domains"] > 1:
            interpretation.append(f"Multiple structural domains ({domains['n_domains']}) suggest complex deformation history")
        
        return " ".join(interpretation)
    
    def _interpret_geostatistical_results(
        self,
        stats: Dict[str, Any],
        variogram: Dict[str, Any],
        cv_results: Dict[str, Any]
    ) -> str:
        """Interpret geostatistical analysis results."""
        interpretation = []
        
        # Interpret basic statistics
        if stats["skewness"] > 1:
            interpretation.append("Highly skewed distribution suggests presence of outliers or mineralization")
        elif stats["skewness"] < -1:
            interpretation.append("Negatively skewed distribution suggests depletion or weathering")
        
        # Interpret variogram
        range_value = variogram["model_parameters"]["range"]
        if range_value > 1000:
            interpretation.append("Large variogram range suggests regional-scale trends")
        else:
            interpretation.append("Small variogram range suggests local-scale variability")
        
        # Interpret cross-validation
        if cv_results.get("r_squared", 0) > 0.7:
            interpretation.append("Good cross-validation results suggest reliable spatial interpolation")
        else:
            interpretation.append("Poor cross-validation results suggest need for model refinement")
        
        return " ".join(interpretation)
    
    def _interpret_stratigraphic_data(
        self,
        thickness: pd.DataFrame,
        lithology_dist: Dict[str, int]
    ) -> str:
        """Interpret stratigraphic data."""
        interpretation = []
        
        # Interpret thickness variations
        thickness_cv = thickness['thickness'].std() / thickness['thickness'].mean()
        if thickness_cv > 0.5:
            interpretation.append("High thickness variability suggests depositional environment changes or structural deformation")
        else:
            interpretation.append("Consistent thickness suggests stable depositional environment")
        
        # Interpret lithology
        dominant_lithology = max(lithology_dist, key=lithology_dist.get)
        interpretation.append(f"Dominant lithology is {dominant_lithology}")
        
        return " ".join(interpretation)
    
    def _interpret_fault_patterns(
        self,
        strike_trends: Dict[str, Any],
        dip_trends: Dict[str, Any]
    ) -> str:
        """Interpret fault patterns."""
        interpretation = []
        
        # Interpret strike patterns
        strike_variance = strike_trends["circular_variance"]
        if strike_variance < 0.3:
            interpretation.append("Consistent fault orientations suggest regional stress field control")
        else:
            interpretation.append("Variable fault orientations suggest complex stress history or multiple deformation events")
        
        # Interpret dip patterns
        dip_mean = dip_trends["circular_mean_deg"]
        if dip_mean > 60:
            interpretation.append("Steep fault dips suggest high-angle faulting or intense deformation")
        else:
            interpretation.append("Moderate fault dips suggest normal or reverse faulting")
        
        return " ".join(interpretation)


# Global geological analysis service instance
geological_analysis_service = GeologicalAnalysisService() 