import { ComparisonResult } from '../types';

const ComparisonView = ({ result }: { result: ComparisonResult }) => {
    return (
        <div>
            <h2>Comparison Results</h2>
            <table>
                <thead>
                <tr>
                    <th>Metric</th>
                    <th>Timeframe 1</th>
                    <th>Timeframe 2</th>
                    <th>Difference</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>Total Story Points</td>
                    <td>{result.timeframe1.storyPoints}</td>
                    <td>{result.timeframe2.storyPoints}</td>
                    <td>{result.difference.storyPoints}</td>
                </tr>
                <tr>
                    <td>Tickets Closed</td>
                    <td>{result.timeframe1.ticketsClosed}</td>
                    <td>{result.timeframe2.ticketsClosed}</td>
                    <td>{result.difference.ticketsClosed}</td>
                </tr>
                {/* Add more metrics as needed */}
                </tbody>
            </table>
        </div>
    );
};

export default ComparisonView;