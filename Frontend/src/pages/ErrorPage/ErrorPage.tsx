import { Link } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';


const ErrorPage = () => {


  return (
    <Layout>
      <div className="document-card-page">
        {/* Кнопка назад */}
        <Link to='/search/results' className='router-link'><div className="back-button">
          <i className="fa fa-arrow-left"></i> Назад к результатам
        </div></Link>

        {/* Заголовок документа */}
        <div className="document-header">
          <h1>Ошибка, запрошеный ресурс не найден</h1>
        </div>
      </div>
    </Layout>
  );
};

export default ErrorPage;