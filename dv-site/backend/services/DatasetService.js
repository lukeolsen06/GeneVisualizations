

class DatasetService {
    async getDataset(comparison) {
        const response = await fetch(`/api/datasets/${comparison}`)
        return response.json()
    }

    async getGenes(comparison, filters) {
        const response = await fetch(`/api/datasets/${comparison}/genes`, {
            method: 'POST',
            body: JSON.stringify(filters)
        })
        
        return response.json()
    }
    
}