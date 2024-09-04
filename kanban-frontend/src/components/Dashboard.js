import React, { useEffect, useState } from 'react';
import { fetchStatistics } from '../services/api';
import { Container, Row, Col, Card } from 'react-bootstrap';

const Dashboard = () => {
  const [statistics, setStatistics] = useState({});

  useEffect(() => {
    const getStatistics = async () => {
      try {
        const data = await fetchStatistics();
        setStatistics(data);
      } catch (error) {
        console.error('Verileri getirirken hata oluştu:', error);
      }
    };

    getStatistics();
  }, []);

  return (
    <Container>
      <Row>
        <Col md={3}>
          <Card>
            <Card.Body>
              <Card.Title>Görev Durum Dağılımı</Card.Title>
              {/* Veriyi göstermek için burada bir grafik veya liste kullanabilirsiniz */}
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <Card.Title>Görev Öncelik Dağılımı</Card.Title>
              {/* Veriyi göstermek için burada bir grafik veya liste kullanabilirsiniz */}
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <Card.Title>Tamamlanan Görevler</Card.Title>
              <Card.Text>{statistics.completed_tasks_last_30_days || 0}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <Card.Title>Kullanıcı Başına Görev</Card.Title>
              {/* Veriyi göstermek için burada bir grafik veya liste kullanabilirsiniz */}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
