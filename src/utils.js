
import { Select } from 'antd'; 

export const isJsonString = (data) => {
    try {
        JSON.parse(data)
    } catch (error) {
        return false
    }
    return true
}

export const getBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
});

export function getItem(label, key, icon, children, type) {
    return {
        key,
        icon,
        children,
        label,
        type,
    };
}

export const renderOptions = (arr) => {
    let results = []
    if (arr) {
        results = arr?.map((opt) => {
            return {
                value: opt,
                label: opt 
            }
        })
    }
    results.push({
        label: 'Thêm type',
        value: 'add-type'
    })
    return results
}

export const convertPrice = (price) => {
    try {
        if (price === null || price === undefined) return ''; 
        if (typeof price !== 'number') return String(price); 

        return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    } catch (e) {
        console.error("Error converting price:", e);
        return price; 
    }
};