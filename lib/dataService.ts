import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export interface BoxScan {
    id: string;
    box_type: string;
    timestamp: any;
    date: string;
    month: string;
    year: string;
}

export async function getBoxScans(): Promise<BoxScan[]> {
    try {
        const scansCol = collection(db, 'box_scans');
        const q = query(scansCol, orderBy('timestamp', 'desc'));
        const scanSnapshot = await getDocs(q);
        const scanList = scanSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as BoxScan));
        return scanList;
    } catch (error) {
        console.error("Error fetching scans:", error);
        return [];
    }
}

export function aggregateDataByBoxType(scans: BoxScan[]) {
    const counts: Record<string, number> = {};
    scans.forEach(scan => {
        counts[scan.box_type] = (counts[scan.box_type] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({
        name: key,
        value: counts[key]
    }));
}

export function aggregateByDate(scans: BoxScan[], type: 'date' | 'month' | 'year') {
    const aggregated: Record<string, Record<string, number>> = {};
    const boxTypes = Array.from(new Set(scans.map(s => s.box_type)));

    scans.forEach(scan => {
        const timeKey = scan[type];
        if (!timeKey) return;

        if (!aggregated[timeKey]) {
            aggregated[timeKey] = {};
            boxTypes.forEach(bt => aggregated[timeKey][bt] = 0);
        }

        aggregated[timeKey][scan.box_type] = (aggregated[timeKey][scan.box_type] || 0) + 1;
    });

    return Object.keys(aggregated).sort().map(timeKey => {
        return {
            time: timeKey,
            ...aggregated[timeKey]
        };
    });
}
