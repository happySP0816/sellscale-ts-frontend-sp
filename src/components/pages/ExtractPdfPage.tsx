import Cards from '@common/analytics/CumulativeGrowth/Cards';
import CumulativeGrowthChart from '@common/analytics/CumulativeGrowth/CumulativeGrowthChart';
import FeedbackTable from '@common/analytics/FeedbackTable/FeedbackTable';
import Message from '@common/analytics/Message';
import { OverallPerformanceChart } from '@common/analytics/OverallPerformanceChart';
import OverallPerformanceProgress from '@common/analytics/OverallPerformanceProgress/OverallPerformanceProgress';
import Volume from '@common/analytics/Volume';
import ProspectFit from '@common/analytics/ProspectFit';
import PipelineSection from '@common/home/PipelineSection';
import {
  Box,
  Divider,
  Flex,
  Paper,
  Image,
  Tabs,
  Title,
  Text,
  Button,
  rem,
  FileInput,
  Stack,
  Group,
  Center,
  SimpleGrid,
  ScrollArea,
  Textarea,
  TextInput,
} from '@mantine/core';
import { IconCalendar } from '@tabler/icons';
import { useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { userTokenState } from '@atoms/userAtoms';
import PageFrame from '@common/PageFrame';
import * as pdfjsLib from 'pdfjs-dist';
import html2canvas from 'html2canvas';
import { processVision } from '@utils/requests/visionProcess';
import { hashString } from '@utils/general';

const MAX_HASH_VAL = 999999;

const ExtractPdfPage = () => {
  const userToken = useRecoilValue(userTokenState);
  const [pdfFile, setFile] = useState<File | null>(null);
  const [pdfImages, setPdfImages] = useState<string[]>([]);
  const [pageNumbersStr, setPageNumbersStr] = useState<string>();
  const [pdfSummaries, setPdfSummaries] = useState<Map<number, string>>(new Map());
  const [visionPrompt, setVisionPrompt] = useState<string>('Summarize the contents of the image.');

  const [loading, setLoading] = useState(false);

  const stringToNumberArray = (input: string): number[] => {
    if (input.includes('-')) {
      const [start, end] = input.split('-').map(Number);
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    } else {
      return input
        .split(',')
        .map((s) => s.trim())
        .map(Number);
    }
  };

  const processPdf = async (file: File, pages: number[]) => {
    // Set the path to the pdf.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      '//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.js';

    // Loading the PDF
    const fileURL = URL.createObjectURL(file);
    const pdf = await pdfjsLib.getDocument(fileURL).promise;
    console.log('PDF loaded');

    const images: string[] = [];
    for (const pageNum of pages) {
      // Fetching the first page
      const page = await pdf.getPage(pageNum);
      console.log('Page loaded');

      const scale = 1.5;
      const viewport = page.getViewport({ scale: scale });

      // Preparing the canvas using PDF page dimensions
      const canvas = document.createElement('canvas');
      let context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render PDF page into canvas context
      await page.render({
        canvasContext: context!,
        viewport: viewport,
      }).promise;
      console.log('Page rendered');

      document.body.appendChild(canvas);

      // Use html2canvas to take a screenshot of the canvas
      const screenshotCanvas = await html2canvas(canvas);

      document.body.removeChild(canvas);

      // You now have the screenshot as a canvas
      // You can display it:
      document.body.appendChild(screenshotCanvas);

      // Or convert it to an image and download it
      const img = screenshotCanvas.toDataURL('image/png');
      images.push(img);

      document.body.removeChild(screenshotCanvas);

      // const link = document.createElement('a');
      // link.download = 'screenshot.png';
      // link.href = img;
      // link.click();
    }

    setPdfImages(images);
    summarizeImages(images);
    return images;
  };

  const summarizeImages = async (images: string[]) => {
    // Use promise.all to send all the images at once
    const result = new Map<number, string>();
    await Promise.all(
      images.map(async (img) => {
        result.set(hashString(img, MAX_HASH_VAL), '');
        const response = await processVision(userToken, visionPrompt, {
          image_url: img,
          max_tokens: 300,
        });

        console.log(response.data);
        const summary = response.status === 'success' ? response.data.response : 'Error';
        result.set(hashString(img, MAX_HASH_VAL), summary);
      })
    );

    setPdfSummaries(result);
    setLoading(false);
  };

  console.log(pdfImages);

  return (
    <PageFrame>
      <Center h={200}>
        <Stack>
          <Box>
            <Title order={3}>Extract PDF</Title>
            <Text>Summarize the pages of your PDF.</Text>
          </Box>
          <Group>
            <FileInput
              w={150}
              description='Input PDF'
              value={pdfFile}
              onChange={setFile}
              accept='.pdf'
            />
            <TextInput
              w={100}
              description='Page Numbers'
              value={pageNumbersStr}
              onChange={(event) => setPageNumbersStr(event.currentTarget.value)}
            />
            <Button
              mt={20}
              loading={loading}
              onClick={() => {
                setLoading(true);
                processPdf(pdfFile!, stringToNumberArray(pageNumbersStr || '1'));
              }}
              disabled={!pdfFile}
            >
              Extract
            </Button>
          </Group>
          <Textarea
            placeholder='Vision Prompt'
            value={visionPrompt}
            onChange={(event) => setVisionPrompt(event.currentTarget.value)}
            minRows={1}
          />
        </Stack>
      </Center>
      <ScrollArea h={500}>
        <SimpleGrid cols={2}>
          {pdfImages.map((img, i) => (
            <Group key={i} align='flex-start' noWrap>
              <Image src={img} width='auto' height={300} fit='contain' radius='md' alt='pdf page' />
              <Textarea
                label='Summary'
                placeholder='Loading...'
                readOnly
                minRows={11}
                w={300}
                value={pdfSummaries.get(hashString(img, MAX_HASH_VAL))}
              />
            </Group>
          ))}
        </SimpleGrid>
      </ScrollArea>
    </PageFrame>
  );
};

export default ExtractPdfPage;
