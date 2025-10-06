

class AnalysisService {
    async getEnrichmentData(comparison, pathway) {
        const response = await fetch(`/api/analyses/enrichment/${comparison}/${pathway}`)
        return response.json();
    }
}